import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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

  // Primeira contagem ao entrar na área logada.
  useEffect(() => {
    contarNaoLidos()
      .then(setNaoLidos)
      .catch(() => {});
  }, []);

  const valor = useMemo(() => ({ naoLidos, recarregar }), [naoLidos, recarregar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAvisos(): ContextoAvisos {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAvisos precisa estar dentro do AvisosProvider');
  return contexto;
}
