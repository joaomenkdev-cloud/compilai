import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Carregando';
import { CampoTexto } from '@/components/CampoTexto';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MenuDono } from '@/components/MenuDono';
import { PostCard } from '@/components/PostCard';
import { TextoComCodigo } from '@/components/TextoComCodigo';
import { areaToque, cores, espaco, familia, fonte, raio, sombra, larguraLeitura, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useCurtir } from '@/hooks/useCurtir';
import { tempoRelativo } from '@/lib/datas';
import { mensagemDeErro } from '@/lib/erros';
import {
  comentar,
  COMENTARIO_MAXIMO,
  editarComentario,
  excluirComentario,
  listarComentarios,
  type Comentario,
} from '@/services/commentService';
import { buscarPost, marcarResolvido, type Post } from '@/services/postService';

export default function TelaPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // key={id}: abrir outro post recomeça a tela do zero (sem mostrar a conversa anterior).
  return <DetalhePost key={id} postId={id} />;
}

function DetalhePost({ postId }: { postId: string }) {
  const router = useRouter();
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const [post, setPost] = useState<Post | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [naoExiste, setNaoExiste] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [resolvendo, setResolvendo] = useState(false);

  const carregar = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const [dadosPost, dadosComentarios] = await Promise.all([
        buscarPost(usuarioId, postId),
        listarComentarios(postId),
      ]);
      setPost(dadosPost);
      setNaoExiste(dadosPost === null);
      setComentarios(dadosComentarios);
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [usuarioId, postId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const { curtindo, alternar } = useCurtir(usuarioId, setPost);

  const tamanho = texto.trim().length;
  const valido = tamanho >= 1 && tamanho <= COMENTARIO_MAXIMO;

  async function aoComentar() {
    if (!usuarioId || !valido || enviando) return;
    setEnviando(true);
    setErroEnvio(null);
    try {
      await comentar(postId, usuarioId, texto);
      setTexto(''); // limpa o campo só depois do sucesso
      await carregar(); // recarrega a conversa (e o contador) em ordem cronológica
    } catch (e) {
      setErroEnvio(mensagemDeErro(e)); // o texto continua no campo
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <View style={estilos.fundo}>
        <Carregando texto="Carregando publicação…" />
      </View>
    );
  }
  if (naoExiste) {
    return (
      <View style={[estilos.fundo, estilos.conteudo]}>
        <EstadoVazio titulo="Publicação não encontrada" mensagem="Ela pode ter sido removida." />
      </View>
    );
  }
  if (!post) {
    return (
      <View style={[estilos.fundo, estilos.conteudo]}>
        <EstadoErro mensagem={erro ?? 'Não foi possível abrir a publicação.'} aoTentarDeNovo={carregar} />
      </View>
    );
  }

  const tituloConversa = comentarios.length === 1 ? '1 comentário' : `${comentarios.length} comentários`;
  // Dúvida resolvida: só o AUTOR do post escolhe a solução (o banco confere de novo).
  const ehAutorDoPost = usuarioId === post.autor_id;
  const podeResolver = post.tipo === 'duvida' && ehAutorDoPost;
  const solucao = post.resolvido_por ? comentarios.find((c) => c.id === post.resolvido_por) : undefined;

  async function escolherSolucao(comentarioId: string | null) {
    if (!post || resolvendo) return;
    setResolvendo(true);
    setErro(null);
    try {
      await marcarResolvido(post.id, comentarioId);
      setPost({ ...post, resolvido_por: comentarioId }); // só depois do sucesso do banco
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setResolvendo(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.fundo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        data={comentarios}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <CabecalhoTela secao="Publicação" titulo="Publicação" />
            <PostCard
              post={post}
              curtindo={curtindo.has(post.id)}
              aoCurtir={alternar}
              noDetalhe
              aoAtualizar={setPost}
              aoRemover={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            />
            {erro ? <EstadoErro mensagem={erro} aoTentarDeNovo={carregar} /> : null}
            {solucao ? (
              <View style={estilos.resumoSolucao} accessible accessibilityLabel={`Dúvida resolvida. Solução de ${solucao.autor_nome}: ${solucao.texto}`}>
                <Ionicons name="checkmark-circle" size={22} color={cores.sucesso} />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.tituloSolucao}>Resolvida · solução de {solucao.autor_nome}</Text>
                  <Text style={estilos.trechoSolucao} numberOfLines={2}>
                    {solucao.texto.replace(/```[\s\S]*?(```|$)/g, '[código]')}
                  </Text>
                </View>
              </View>
            ) : post.tipo === 'duvida' && ehAutorDoPost && comentarios.length > 0 ? (
              <Text style={estilos.dicaSolucao}>Alguém resolveu sua dúvida? Toque em “Marcar como solução” no comentário.</Text>
            ) : null}
            <Text style={estilos.tituloConversa} accessibilityRole="header">
              {tituloConversa}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
        renderItem={({ item }) => {
          const ehSolucao = item.id === post.resolvido_por;
          const ehMeu = item.autor_id === usuarioId;
          return (
          <View style={[estilos.comentario, ehSolucao && estilos.comentarioSolucao]}>
            <Avatar nome={item.autor_nome} tamanho={36} />
            <View style={estilos.corpoComentario}>
              <View style={estilos.linhaAutor}>
                <Pressable
                  onPress={() => router.push({ pathname: '/pessoa/[id]', params: { id: item.autor_id } })}
                  accessibilityRole="link"
                  accessibilityLabel={`Perfil de ${item.autor_nome}`}
                  hitSlop={10}
                >
                  <Text style={estilos.autor}>{item.autor_nome}</Text>
                </Pressable>
                <Text style={estilos.data}>
                  {tempoRelativo(item.criado_em)}
                  {item.editado_em ? ' · editado' : ''}
                </Text>
                <View style={{ flex: 1 }} />
                {ehMeu ? (
                  <MenuDono
                    oQue="comentário"
                    textoAtual={item.texto}
                    maximo={COMENTARIO_MAXIMO}
                    aoSalvar={async (novoTexto) => {
                      await editarComentario(item.id, novoTexto);
                      setComentarios((lista) =>
                        lista.map((c) =>
                          c.id === item.id ? { ...c, texto: novoTexto.trim(), editado_em: new Date().toISOString() } : c,
                        ),
                      );
                    }}
                    aoExcluir={async () => {
                      await excluirComentario(item.id);
                      await carregar(); // recarrega conversa, contador e a solução (se era este)
                    }}
                  />
                ) : null}
              </View>
              {ehSolucao ? (
                <View style={estilos.seloSolucao}>
                  <Ionicons name="checkmark-circle" size={16} color={cores.sucesso} />
                  <Text style={estilos.textoSelo}>Resolveu a dúvida</Text>
                </View>
              ) : null}
              <TextoComCodigo texto={item.texto} estiloTexto={estilos.textoComentario} selecionavel />
              {podeResolver ? (
                <Pressable
                  onPress={() => escolherSolucao(ehSolucao ? null : item.id)}
                  disabled={resolvendo}
                  accessibilityRole="button"
                  accessibilityLabel={ehSolucao ? 'Desmarcar solução' : `Marcar comentário de ${item.autor_nome} como solução`}
                  accessibilityState={{ disabled: resolvendo, selected: ehSolucao }}
                  style={({ pressed }) => [estilos.botaoSolucao, ehSolucao && estilos.botaoSolucaoAtivo, (pressed || resolvendo) && { opacity: 0.6 }]}
                >
                  <Ionicons name={ehSolucao ? 'close-circle-outline' : 'checkmark-circle-outline'} size={18} color={ehSolucao ? cores.textoSuave : cores.sucesso} />
                  <Text style={[estilos.textoBotaoSolucao, ehSolucao && { color: cores.textoSuave }]}>
                    {ehSolucao ? 'Desmarcar solução' : 'Marcar como solução'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          );
        }}
        ListEmptyComponent={<EstadoVazio icone="chatbubble-ellipses-outline" titulo="Nenhum comentário ainda" mensagem="Puxe a conversa!" />}
        ListFooterComponent={
          <View style={estilos.formulario}>
            <CampoTexto
              rotulo="Seu comentário"
              value={texto}
              onChangeText={setTexto}
              multiline
              textAlignVertical="top"
              style={estilos.campo}
              placeholder="Escreva algo gentil e útil"
              erro={tamanho > COMENTARIO_MAXIMO ? `Use até ${COMENTARIO_MAXIMO} caracteres.` : null}
            />
            <Text style={estilos.contador} accessibilityLabel={`${tamanho} de ${COMENTARIO_MAXIMO} caracteres`}>
              {tamanho}/{COMENTARIO_MAXIMO}
            </Text>
            {erroEnvio ? (
              <EstadoErro mensagem={`O comentário não foi enviado. ${erroEnvio}`} aoTentarDeNovo={aoComentar} />
            ) : null}
            <Botao titulo="Comentar" aoPressionar={aoComentar} desativado={!valido} carregando={enviando} />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregar();
            }}
            colors={[cores.primaria]}
            tintColor={cores.primaria}
          />
        }
      />
    </KeyboardAvoidingView>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { ...larguraLeitura, padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.md },
  tituloConversa: { ...fonte.subtitulo, color: cores.primaria },
  comentario: {
    flexDirection: 'row',
    gap: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    ...sombra.card,
    padding: espaco.md,
  },
  corpoComentario: { flex: 1, gap: espaco.xs },
  linhaAutor: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexWrap: 'wrap' },
  autor: { ...fonte.rotulo, color: cores.primaria },
  data: { ...fonte.pequena, color: cores.textoSuave },
  textoComentario: { ...fonte.corpo, color: cores.texto },
  comentarioSolucao: { borderWidth: 2, borderColor: cores.sucesso },
  seloSolucao: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  textoSelo: { fontFamily: familia.negrito, fontSize: 12, color: cores.sucesso },
  botaoSolucao: {
    alignSelf: 'flex-start',
    minHeight: areaToque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espaco.md,
    borderRadius: 999,
    backgroundColor: cores.sucessoClaro,
    marginTop: espaco.xs,
  },
  botaoSolucaoAtivo: { backgroundColor: cores.superficieSuave },
  textoBotaoSolucao: { fontFamily: familia.negrito, fontSize: 13, color: cores.sucesso },
  resumoSolucao: {
    flexDirection: 'row',
    gap: espaco.md,
    alignItems: 'center',
    padding: espaco.md,
    borderRadius: raio.card,
    backgroundColor: cores.sucessoClaro,
    borderLeftWidth: 4,
    borderLeftColor: cores.sucesso,
  },
  tituloSolucao: { fontFamily: familia.negrito, fontSize: 14, color: cores.sucesso },
  trechoSolucao: { ...fonte.pequena, color: cores.texto },
  dicaSolucao: { ...fonte.pequena, color: cores.textoSuave },
  formulario: { marginTop: espaco.xl, gap: espaco.sm },
  campo: { minHeight: 90, paddingTop: espaco.md },
  contador: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'right' },
}));
