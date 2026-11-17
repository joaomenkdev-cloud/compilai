import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';

/**
 * TEMPO REAL no detalhe do post: quando alguém comenta, edita um comentário, edita o post
 * ou marca a solução, a tela recarrega sozinha (mantendo a ordem cronológica do PDF).
 *
 * Só escuta INSERT/UPDATE: o Realtime não aplica filtro em DELETE. Quem exclui o próprio
 * comentário já recarrega a tela; o de outra pessoa some na próxima atualização.
 * O Realtime respeita o RLS: só chegam eventos de linhas que a pessoa já poderia ler.
 */
export function useConversaAoVivo(postId: string, aoMudar: () => void) {
  // Guarda a função mais recente sem reassinar o canal a cada render.
  const ref = useRef(aoMudar);
  useEffect(() => {
    ref.current = aoMudar;
  }, [aoMudar]);

  useEffect(() => {
    let ativo = true;
    let espera: ReturnType<typeof setTimeout> | undefined;
    // Junta vários eventos seguidos (ex.: comentário + contador) num recarregamento só.
    const avisar = () => {
      if (!ativo) return;
      clearTimeout(espera);
      espera = setTimeout(() => ativo && ref.current(), 300);
    };

    const canal = supabase
      .channel(`conversa-${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, avisar)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, avisar)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts', filter: `id=eq.${postId}` }, avisar);

    supabase.realtime
      .setAuth()
      .catch(() => {})
      .finally(() => {
        if (ativo) canal.subscribe();
      });

    return () => {
      ativo = false;
      clearTimeout(espera);
      supabase.removeChannel(canal);
    };
  }, [postId]);
}
