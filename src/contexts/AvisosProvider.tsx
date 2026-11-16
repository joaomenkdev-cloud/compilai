import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

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

  const valor = useMemo(() => ({ naoLidos, recarregar }), [naoLidos, recarregar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAvisos(): ContextoAvisos {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAvisos precisa estar dentro do AvisosProvider');
  return contexto;
}
