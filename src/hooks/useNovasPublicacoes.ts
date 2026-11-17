import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

/**
 * TEMPO REAL (Supabase Realtime): conta quantas publicações novas de OUTRAS pessoas
 * chegaram enquanto o feed está aberto, para mostrar "2 novas publicações · toque para ver".
 *
 * Não insere nada na lista sozinho (a pessoa decide quando atualizar, sem a tela "pular").
 * O Realtime respeita o RLS: só chegam eventos de linhas que a pessoa já poderia ler.
 */
export function useNovasPublicacoes(usuarioId: string | undefined) {
  const [novas, setNovas] = useState(0);

  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    const canal = supabase.channel(`feed-${usuarioId}`).on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'posts' },
      (evento) => {
        const autor = (evento.new as { autor_id?: string }).autor_id;
        if (ativo && autor && autor !== usuarioId) setNovas((n) => n + 1);
      },
    );

    // Garante que o canal use o token da sessão (para o RLS valer) antes de assinar.
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

  return { novas, limpar: () => setNovas(0) };
}
