import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import * as authService from '@/services/authService';
import { buscarPerfil, garantirPerfil, type Perfil } from '@/services/profileService';

type ContextoAuth = {
  usuario: User | null;
  perfil: Perfil | null;
  /** true enquanto lê a sessão salva (e o perfil dela) ao abrir o app. */
  carregando: boolean;
  entrar: typeof authService.entrar;
  cadastrar: typeof authService.cadastrar;
  sair: () => Promise<void>;
  /** Usado depois de editar o perfil, para as telas verem o dado novo. */
  atualizarPerfil: (perfil: Perfil) => void;
};

const Contexto = createContext<ContextoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [iniciou, setIniciou] = useState(false);
  // Guardamos de qual usuário é o perfil, para nunca mostrar o perfil de outra conta.
  const [perfilCarregado, setPerfilCarregado] = useState<{ id: string; perfil: Perfil | null } | null>(null);

  // 1) Restaura a sessão salva e acompanha login/logout/renovação do token.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSessao(data.session))
      .catch(() => setSessao(null))
      .finally(() => setIniciou(true));

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      // Só guarda a sessão aqui; chamadas ao banco ficam no efeito abaixo
      // (o SDK recomenda não chamar o Supabase dentro deste callback).
      setSessao(novaSessao);
    });
    return () => data.subscription.unsubscribe(); // descarta a assinatura ao desmontar
  }, []);

  const usuario = sessao?.user ?? null;
  const idUsuario = usuario?.id;
  const nomeNosMetadados = usuario?.user_metadata?.nome as string | undefined;
  const emailUsuario = usuario?.email;

  // 2) Com sessão, garante que o perfil exista (1º login) e carrega.
  useEffect(() => {
    if (!idUsuario) return;
    let cancelado = false;
    const nome = nomeNosMetadados?.trim() || emailUsuario?.split('@')[0] || 'Pessoa';

    garantirPerfil(idUsuario, nome)
      .then(() => buscarPerfil(idUsuario))
      .catch(() => null) // sem rede/sem tabela: o app abre mesmo assim, sem o perfil
      .then((perfil) => {
        if (!cancelado) setPerfilCarregado({ id: idUsuario, perfil });
      });
    return () => {
      cancelado = true;
    };
  }, [idUsuario, nomeNosMetadados, emailUsuario]);

  const perfil = perfilCarregado && perfilCarregado.id === idUsuario ? perfilCarregado.perfil : null;
  const carregando = !iniciou || (idUsuario !== undefined && perfilCarregado?.id !== idUsuario);

  const atualizarPerfil = useCallback((novo: Perfil) => setPerfilCarregado({ id: novo.id, perfil: novo }), []);

  const valor = useMemo<ContextoAuth>(
    () => ({
      usuario,
      perfil,
      carregando,
      entrar: authService.entrar,
      cadastrar: authService.cadastrar,
      sair: authService.sair,
      atualizarPerfil,
    }),
    [usuario, perfil, carregando, atualizarPerfil],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAuth precisa estar dentro do AuthProvider');
  return contexto;
}
