import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AbasInternas } from '@/components/AbasInternas';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Carregando } from '@/components/Carregando';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { PostCard } from '@/components/PostCard';
import { cores, espaco } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useCurtir } from '@/hooks/useCurtir';
import { mensagemDeErro } from '@/lib/erros';
import { buscarPosts, type Post } from '@/services/postService';

type AbaInicio = 'recentes' | 'minhas';

export default function Inicio() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const [aba, setAba] = useState<AbaInicio>('recentes');
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // Cada busca ganha um número; só a mais recente pode mexer na tela
  // (evita que uma resposta atrasada da outra aba sobrescreva a lista).
  const ultimaBusca = useRef(0);

  const carregar = useCallback(async () => {
    if (!usuarioId) return;
    const numero = ++ultimaBusca.current;
    try {
      // Recentes: feed de todos. Minhas: o mesmo feed filtrado por autor_id.
      const dados = await buscarPosts(usuarioId, aba === 'minhas' ? { autorId: usuarioId } : {});
      if (numero !== ultimaBusca.current) return;
      setPosts(dados);
      setErro(null);
    } catch (e) {
      if (numero !== ultimaBusca.current) return;
      setErro(mensagemDeErro(e));
    } finally {
      if (numero === ultimaBusca.current) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, [usuarioId, aba]);

  // Recarrega sempre que a tela ganha foco (ex.: voltando de Publicar) ou a aba muda.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function mudarAba(nova: AbaInicio) {
    if (nova === aba) return;
    setPosts([]);
    setErro(null);
    setCarregando(true);
    setAba(nova);
  }

  function puxarParaAtualizar() {
    setAtualizando(true);
    carregar();
  }

  const atualizarPost = useCallback(
    (novo: Post) => setPosts((lista) => lista.map((p) => (p.id === novo.id ? novo : p))),
    [],
  );
  const { curtindo, alternar } = useCurtir(usuarioId, atualizarPost);

  function conteudoVazio() {
    if (carregando) return <Carregando texto="Carregando publicações…" />;
    if (erro) return <EstadoErro mensagem={erro} aoTentarDeNovo={carregar} />;
    return aba === 'recentes' ? (
      <EstadoVazio titulo="Ainda não há publicações" mensagem="Seja a primeira pessoa a contar o que está construindo!" />
    ) : (
      <EstadoVazio titulo="Você ainda não publicou" mensagem="Use a aba Publicar para compartilhar um projeto, dúvida ou conquista." />
    );
  }

  return (
    <FlatList
      style={estilos.fundo}
      contentContainerStyle={estilos.conteudo}
      data={posts}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => <PostCard post={item} curtindo={curtindo.has(item.id)} aoCurtir={alternar} />}
      ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <CabecalhoTela secao="Início" titulo="Comunidade" />
          <AbasInternas
            abas={[
              { id: 'recentes', rotulo: 'Recentes' },
              { id: 'minhas', rotulo: 'Minhas' },
            ]}
            selecionada={aba}
            aoMudar={mudarAba}
          />
          {/* Erro ao atualizar, mas ainda com a lista anterior na tela */}
          {erro && posts.length > 0 ? <EstadoErro mensagem={erro} aoTentarDeNovo={carregar} /> : null}
        </View>
      }
      ListEmptyComponent={conteudoVazio()}
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={puxarParaAtualizar} colors={[cores.primaria]} tintColor={cores.primaria} />
      }
    />
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.lg },
});
