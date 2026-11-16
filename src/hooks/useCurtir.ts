import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { mensagemDeErro } from '@/lib/erros';
import { alternarCurtida } from '@/services/likeService';
import type { Post } from '@/services/postService';

/**
 * Lógica de curtir/descurtir compartilhada pelas listas de posts.
 * - trava aquele post até o banco responder (sem toque duplo);
 * - só muda botão e contador DEPOIS do retorno do banco.
 */
export function useCurtir(usuarioId: string | undefined, aoAtualizar: (post: Post) => void) {
  // O ref barra o 2º toque na hora (antes mesmo de a tela redesenhar);
  // o estado serve para desenhar o botão como "ocupado".
  const emAndamento = useRef(new Set<string>());
  const [curtindo, setCurtindo] = useState<ReadonlySet<string>>(new Set());

  const alternar = useCallback(
    async (post: Post) => {
      if (!usuarioId || emAndamento.current.has(post.id)) return;
      emAndamento.current.add(post.id);
      setCurtindo(new Set(emAndamento.current));
      try {
        const resultado = await alternarCurtida(post.id, usuarioId, post.curtido);
        aoAtualizar({ ...post, ...resultado });
      } catch (e) {
        Alert.alert('Curtida não registrada', mensagemDeErro(e));
      } finally {
        emAndamento.current.delete(post.id);
        setCurtindo(new Set(emAndamento.current));
      }
    },
    [usuarioId, aoAtualizar],
  );

  return { curtindo, alternar };
}
