import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { aplicarEsquema, type Esquema } from '@/constants/tema';

// Preferência da pessoa: seguir o aparelho ("sistema") ou forçar claro/escuro.
export type Preferencia = 'sistema' | 'claro' | 'escuro';

const CHAVE = 'compilai:tema';

type Valor = {
  preferencia: Preferencia;
  esquema: Esquema;
  definir: (p: Preferencia) => void;
};

const Contexto = createContext<Valor | null>(null);

export function useTema() {
  const v = useContext(Contexto);
  if (!v) throw new Error('useTema precisa estar dentro do TemaProvider');
  return v;
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<Preferencia>('sistema');
  const [lida, setLida] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((v) => {
        if (v === 'claro' || v === 'escuro' || v === 'sistema') setPreferencia(v);
      })
      .catch(() => {})
      .finally(() => setLida(true));
  }, []);

  const esquema: Esquema = preferencia === 'sistema' ? (sistema === 'dark' ? 'escuro' : 'claro') : preferencia;

  // Troca as cores ANTES de renderizar os filhos (quem usa o contexto remonta as telas com key={esquema}).
  aplicarEsquema(esquema);

  const definir = useCallback((p: Preferencia) => {
    setPreferencia(p);
    AsyncStorage.setItem(CHAVE, p).catch(() => {});
  }, []);

  const valor = useMemo(() => ({ preferencia, esquema, definir }), [preferencia, esquema, definir]);

  // Só mostra o app depois de ler a preferência salva (evita piscar o tema errado).
  if (!lida) return null;

  return (
    <Contexto.Provider value={valor}>
      {children}
    </Contexto.Provider>
  );
}
