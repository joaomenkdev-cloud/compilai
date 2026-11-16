import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AbasInternas } from '@/components/AbasInternas';
import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Carregando } from '@/components/Carregando';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { PostCard } from '@/components/PostCard';
import { cores, espaco, fonte, raio } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useCurtir } from '@/hooks/useCurtir';
import { mensagemDeErro } from '@/lib/erros';
import { buscarPosts, type Post } from '@/services/postService';
import { buscarPerfil, type Perfil } from '@/services/profileService';

type Aba = 'posts' | 'sobre';
type Props = {
  pessoaId: string;
  /** true só na aba Perfil (o próprio perfil): mostra o botão Editar perfil. */
  ehProprio: boolean;
};

// Conteúdo comum ao perfil próprio e ao perfil público de outra pessoa.
// A diferença: só o titular vê "Editar perfil". Os dados vêm sempre pelo ID.
export function ConteudoPerfil({ pessoaId, ehProprio }: Props) {
  const router = useRouter();
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const [aba, setAba] = useState<Aba>('posts');
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [naoExiste, setNaoExiste] = useState(false);

  const carregar = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const [dadosPerfil, dadosPosts] = await Promise.all([
        buscarPerfil(pessoaId),
        buscarPosts(usuarioId, { autorId: pessoaId }),
      ]);
      setPerfil(dadosPerfil);
      setNaoExiste(dadosPerfil === null);
      setPosts(dadosPosts);
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [usuarioId, pessoaId]);

  // Recarrega ao abrir/voltar (ex.: depois de editar a biografia).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const atualizarPost = useCallback(
    (novo: Post) => setPosts((lista) => lista.map((p) => (p.id === novo.id ? novo : p))),
    [],
  );
  const { curtindo, alternar } = useCurtir(usuarioId, atualizarPost);

  if (carregando) return <View style={estilos.fundo}><Carregando texto="Carregando perfil…" /></View>;
  if (naoExiste) {
    return (
      <View style={[estilos.fundo, estilos.conteudo]}>
        <EstadoVazio titulo="Perfil não encontrado" mensagem="Essa pessoa pode ter saído da comunidade." />
      </View>
    );
  }
  if (!perfil) {
    return (
      <View style={[estilos.fundo, estilos.conteudo]}>
        <EstadoErro mensagem={erro ?? 'Não foi possível carregar o perfil.'} aoTentarDeNovo={carregar} />
      </View>
    );
  }

  const cabecalho = (
    <View style={estilos.cabecalho}>
      <CabecalhoTela secao={ehProprio ? 'Perfil' : 'Pessoa'} titulo={ehProprio ? 'Meu perfil' : 'Perfil'} />
      <View style={estilos.cartao}>
        <Avatar nome={perfil.nome} tamanho={64} />
        <View style={estilos.identidade}>
          <Text style={estilos.nome} accessibilityRole="header">
            {perfil.nome}
          </Text>
          <Text style={estilos.resumo}>
            {posts.length === 1 ? '1 publicação' : `${posts.length} publicações`}
          </Text>
        </View>
      </View>
      {ehProprio ? (
        <Botao titulo="Editar perfil" variante="secundario" aoPressionar={() => router.push('/editar-perfil')} />
      ) : null}
      <AbasInternas
        abas={[
          { id: 'posts', rotulo: 'Posts' },
          { id: 'sobre', rotulo: 'Sobre' },
        ]}
        selecionada={aba}
        aoMudar={setAba}
      />
      {erro ? <EstadoErro mensagem={erro} aoTentarDeNovo={carregar} /> : null}
    </View>
  );

  const sobre = (
    <View style={estilos.caixaSobre}>
      <Text style={estilos.rotulo}>Nome</Text>
      <Text style={estilos.valor}>{perfil.nome}</Text>
      <Text style={estilos.rotulo}>Biografia</Text>
      <Text style={[estilos.valor, !perfil.bio && estilos.vazio]}>
        {perfil.bio || (ehProprio ? 'Você ainda não escreveu sua biografia.' : 'Sem biografia ainda.')}
      </Text>
    </View>
  );

  return (
    <FlatList
      style={estilos.fundo}
      contentContainerStyle={estilos.conteudo}
      data={aba === 'posts' ? posts : []}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => <PostCard post={item} curtindo={curtindo.has(item.id)} aoCurtir={alternar} />}
      ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={
        aba === 'sobre' ? sobre : <EstadoVazio titulo="Nenhuma publicação ainda" />
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
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.lg },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
  },
  identidade: { flex: 1, gap: espaco.xs },
  nome: { ...fonte.subtitulo, fontSize: 22, color: cores.primaria },
  resumo: { ...fonte.pequena, color: cores.textoSuave },
  caixaSobre: {
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.xs,
  },
  rotulo: { ...fonte.sobrancelha, color: cores.destaqueTexto, marginTop: espaco.sm },
  valor: { ...fonte.corpo, color: cores.texto },
  vazio: { color: cores.textoSuave, fontStyle: 'italic' },
});
