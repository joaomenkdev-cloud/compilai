import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/lib/supabase';
import { contarNaoLidos } from '@/services/notificationService';

type ContextoAvisos = {
  /** Total de avisos não lidos (mostrado no menu lateral). */
  naoLidos: number;
  /** Consulta o total de novo no banco. */
  recarregar: () => Promise<void>;
};

const Contexto = createContext<ContextoAvisos | null>(null);

// Fica dentro da área (rede): ao sair da conta ela é desmontada e o contador some junto.
export function AvisosProvider({ children }: { children: ReactNode }) {
  const [naoLidos, setNaoLidos] = useState(0);
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const recarregar = useCallback(async () => {
    try {
      setNaoLidos(await contarNaoLidos());
    } catch {
      // Sem rede: mantém o último número conhecido.
    }
  }, []);

  // Conta ao entrar na área logada, quando o app volta para a frente e a cada
  // 60 s enquanto está aberto (assim o sino do cabeçalho não fica desatualizado).
  useEffect(() => {
    const contar = () =>
      contarNaoLidos()
        .then(setNaoLidos)
        .catch(() => {}); // sem rede: mantém o último número
    contar();
    const intervalo = setInterval(contar, 60_000);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') contar();
    });
    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, []);

  // TEMPO REAL: quando o banco cria (curtida, comentário, resolução) ou marca como lido
  // um aviso MEU, o contador do sino e do menu atualiza na hora, sem esperar 60 s.
  // O filtro destino_id e o RLS garantem que só chegam eventos dos meus avisos.
  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    const contar = () =>
      contarNaoLidos()
        .then((n) => ativo && setNaoLidos(n))
        .catch(() => {});
    const canal = supabase.channel(`avisos-${usuarioId}`).on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications', filter: `destino_id=eq.${usuarioId}` },
      contar,
    );
    supabase.realtime
      .setAuth()
      .catch(() => {})
      .finally(() => {
        if (ativo) canal.subscribe();
      });
    return () => {
      ativo = false;
      supabase.removeChannel(canal);
    };
  }, [usuarioId]);

  const valor = useMemo(() => ({ naoLidos, recarregar }), [naoLidos, recarregar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAvisos(): ContextoAvisos {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAvisos precisa estar dentro do AvisosProvider');
  return contexto;
}
