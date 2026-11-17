import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BotaoCurtir } from '@/components/BotaoCurtir';
import { EtiquetaTipo } from '@/components/EtiquetaTipo';
import { MenuDono } from '@/components/MenuDono';
import { TextoComCodigo } from '@/components/TextoComCodigo';
import { areaToque, cores, espaco, familia, fonte, pressionado, raio, sombra, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { tempoRelativo } from '@/lib/datas';
import { editarPost, excluirPost, TEXTO_MAXIMO, type Post } from '@/services/postService';

type Props = {
  post: Post;
  curtindo: boolean;
  aoCurtir: (post: Post) => void;
  /** No detalhe, o texto não é tocável (já estamos no post). */
  noDetalhe?: boolean;
  /** Depois de editar: a lista troca o post pelo novo. */
  aoAtualizar?: (post: Post) => void;
  /** Depois de excluir: a lista tira o post (no detalhe, volta à tela anterior). */
  aoRemover?: (postId: string) => void;
};

// Cartão de uma publicação. Cada parte tocável é um alvo separado para o leitor de tela:
// nome (abre o perfil pelo ID), texto (abre o post pelo ID), curtir e comentários.
// O menu ⋯ (editar/excluir) só aparece para quem escreveu o post.
// memo: numa lista grande, só o cartão que mudou (ex.: curtido) é redesenhado.
export const PostCard = memo(function PostCard({
  post,
  curtindo,
  aoCurtir,
  noDetalhe = false,
  aoAtualizar,
  aoRemover,
}: Props) {
  const router = useRouter();
  const { usuario } = useAuth();
  const ehDono = usuario?.id === post.autor_id;
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
          <Text style={estilos.data}>
            {tempoRelativo(post.criado_em)}
            {post.editado_em ? ' · editado' : ''}
          </Text>
        </View>
        <EtiquetaTipo tipo={post.tipo} resolvida={!!post.resolvido_por} />
        {ehDono ? (
          <MenuDono
            oQue="publicação"
            textoAtual={post.texto}
            tipoAtual={post.tipo}
            maximo={TEXTO_MAXIMO}
            aoSalvar={async (texto, tipo) => {
              const novoTipo = tipo ?? post.tipo;
              await editarPost(post.id, texto, novoTipo);
              aoAtualizar?.({
                ...post,
                texto: texto.trim(),
                tipo: novoTipo,
                editado_em: new Date().toISOString(),
                resolvido_por: novoTipo === 'duvida' ? post.resolvido_por : null,
              });
            }}
            aoExcluir={async () => {
              await excluirPost(post.id);
              aoRemover?.(post.id);
            }}
          />
        ) : null}
      </View>

      {noDetalhe ? (
        <TextoComCodigo texto={post.texto} estiloTexto={[estilos.texto, estilos.textoDetalhe]} selecionavel />
      ) : (
        <Pressable
          onPress={abrirPost}
          accessibilityRole="button"
          accessibilityHint="Abre a publicação e os comentários"
          style={({ pressed }) => pressed && estilos.textoPressionado}
        >
          <TextoComCodigo texto={post.texto} estiloTexto={estilos.texto} linhas={8} />
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

const estilos = estiloTema(() => StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    padding: espaco.lg,
    gap: espaco.md,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  autor: { flex: 1, gap: 1, marginLeft: 4 },
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
}));
