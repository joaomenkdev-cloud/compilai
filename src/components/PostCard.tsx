import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BotaoCurtir } from '@/components/BotaoCurtir';
import { areaToque, cores, espaco, familia, fonte, pressionado, raio, sombra } from '@/constants/tema';
import { tempoRelativo } from '@/lib/datas';
import type { Post } from '@/services/postService';

type Props = {
  post: Post;
  curtindo: boolean;
  aoCurtir: (post: Post) => void;
  /** No detalhe, o texto não é tocável (já estamos no post). */
  noDetalhe?: boolean;
};

// Cartão de uma publicação. Cada parte tocável é um alvo separado para o leitor de tela:
// nome (abre o perfil pelo ID), texto (abre o post pelo ID), curtir e comentários.
// memo: numa lista grande, só o cartão que mudou (ex.: curtido) é redesenhado.
export const PostCard = memo(function PostCard({ post, curtindo, aoCurtir, noDetalhe = false }: Props) {
  const router = useRouter();
  const abrirPost = () => router.push({ pathname: '/post/[id]', params: { id: post.id } });
  const abrirAutor = () => router.push({ pathname: '/pessoa/[id]', params: { id: post.autor_id } });
  const comentarios = post.comentarios === 1 ? '1 comentário' : `${post.comentarios} comentários`;

  return (
    <View style={[estilos.card, sombra.card]}>
      <View style={estilos.topo}>
        <Avatar nome={post.autor_nome} />
        <View style={estilos.autor}>
          <Pressable
            onPress={abrirAutor}
            accessibilityRole="link"
            accessibilityLabel={`Perfil de ${post.autor_nome}`}
            hitSlop={10}
          >
            <Text style={estilos.nome}>{post.autor_nome}</Text>
          </Pressable>
          <Text style={estilos.data}>{tempoRelativo(post.criado_em)}</Text>
        </View>
      </View>

      {noDetalhe ? (
        <Text style={[estilos.texto, estilos.textoDetalhe]} selectable>
          {post.texto}
        </Text>
      ) : (
        <Pressable
          onPress={abrirPost}
          accessibilityRole="button"
          accessibilityHint="Abre a publicação e os comentários"
          style={({ pressed }) => pressed && estilos.textoPressionado}
        >
          <Text style={estilos.texto} numberOfLines={8}>
            {post.texto}
          </Text>
        </Pressable>
      )}

      <View style={estilos.rodape}>
        <BotaoCurtir
          curtido={post.curtido}
          curtidas={post.curtidas}
          ocupado={curtindo}
          aoPressionar={() => aoCurtir(post)}
        />
        <Pressable
          onPress={noDetalhe ? undefined : abrirPost}
          disabled={noDetalhe}
          accessibilityRole={noDetalhe ? 'text' : 'button'}
          accessibilityLabel={noDetalhe ? comentarios : `${comentarios}. Abrir conversa`}
          style={({ pressed }) => [estilos.comentarios, pressed && !noDetalhe && pressionado]}
        >
          <Ionicons name="chatbubble-outline" size={19} color={cores.textoSuave} />
          <Text style={estilos.textoComentarios}>{post.comentarios}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    padding: espaco.lg,
    gap: espaco.md,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  autor: { flex: 1, gap: 1 },
  nome: { fontFamily: familia.negrito, fontSize: 16, color: cores.texto },
  data: { ...fonte.pequena, color: cores.textoSuave },
  texto: { ...fonte.corpo, color: cores.texto },
  textoDetalhe: { fontSize: 18, lineHeight: 27 },
  textoPressionado: { opacity: 0.6 },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingTop: espaco.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
  comentarios: {
    minHeight: areaToque,
    minWidth: areaToque,
    paddingHorizontal: espaco.md,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoComentarios: { fontFamily: familia.medio, fontSize: 14, color: cores.texto },
});
