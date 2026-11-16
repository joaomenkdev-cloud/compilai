import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Carregando';
import { CampoTexto } from '@/components/CampoTexto';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { PostCard } from '@/components/PostCard';
import { cores, espaco, fonte, raio } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useCurtir } from '@/hooks/useCurtir';
import { tempoRelativo } from '@/lib/datas';
import { mensagemDeErro } from '@/lib/erros';
import { comentar, COMENTARIO_MAXIMO, listarComentarios, type Comentario } from '@/services/commentService';
import { buscarPost, type Post } from '@/services/postService';

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
            <PostCard post={post} curtindo={curtindo.has(post.id)} aoCurtir={alternar} noDetalhe />
            {erro ? <EstadoErro mensagem={erro} aoTentarDeNovo={carregar} /> : null}
            <Text style={estilos.tituloConversa} accessibilityRole="header">
              {tituloConversa}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
        renderItem={({ item }) => (
          <View style={estilos.comentario}>
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
                <Text style={estilos.data}>{tempoRelativo(item.criado_em)}</Text>
              </View>
              <Text style={estilos.textoComentario}>{item.texto}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EstadoVazio titulo="Nenhum comentário ainda" mensagem="Puxe a conversa!" />}
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

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.md },
  tituloConversa: { ...fonte.subtitulo, color: cores.primaria },
  comentario: {
    flexDirection: 'row',
    gap: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
  },
  corpoComentario: { flex: 1, gap: espaco.xs },
  linhaAutor: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexWrap: 'wrap' },
  autor: { ...fonte.rotulo, color: cores.primaria },
  data: { ...fonte.pequena, color: cores.textoSuave },
  textoComentario: { ...fonte.corpo, color: cores.texto },
  formulario: { marginTop: espaco.xl, gap: espaco.sm },
  campo: { minHeight: 90, paddingTop: espaco.md },
  contador: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'right' },
});
