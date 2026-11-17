import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AbasInternas } from '@/components/AbasInternas';
import { BannerOffline } from '@/components/BannerOffline';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CaixaPublicar } from '@/components/CaixaPublicar';
import { ColunaComunidade } from '@/components/ColunaComunidade';
import { Carregando } from '@/components/Carregando';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { PostCard } from '@/components/PostCard';
import { cores, espaco, larguraLeitura, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useCurtir } from '@/hooks/useCurtir';
import { useLayout } from '@/hooks/useLayout';
import { ehErroDeRede, mensagemDeErro } from '@/lib/erros';
import { buscarFeed, buscarPosts, type Post } from '@/services/postService';
import { lerFeed } from '@/storage/feedCache';

type AbaInicio = 'recentes' | 'minhas';

const PRIMEIRO_CARREGAMENTO = 'O primeiro carregamento precisa de internet. Conecte-se e puxe a tela para atualizar.';

export default function Inicio() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;
  const { tresColunas } = useLayout();

  const [aba, setAba] = useState<AbaInicio>('recentes');
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  /** Preenchido quando a lista veio do cache por falta de rede: data da última atualização. */
  const [offline, setOffline] = useState<{ atualizado: string | null } | null>(null);

  // Cada busca ganha um número; só a mais recente pode mexer na tela.
  const ultimaBusca = useRef(0);
  // O cache é mostrado só na primeira carga de cada aba (depois a lista já está na tela).
  const cacheJaMostrado = useRef(false);

  const carregar = useCallback(async () => {
    if (!usuarioId) return;
    const numero = ++ultimaBusca.current;
    const atual = () => numero === ultimaBusca.current;

    // 1) Mostra a última cópia salva no aparelho ENQUANTO busca os dados novos.
    if (!cacheJaMostrado.current) {
      cacheJaMostrado.current = true;
      const salvo = await lerFeed(usuarioId).catch(() => null);
      if (salvo && atual()) {
        setPosts(aba === 'minhas' ? salvo.posts.filter((p) => p.autor_id === usuarioId) : salvo.posts);
        setCarregando(false);
      }
    }

    // 2) Busca na nuvem.
    try {
      if (aba === 'recentes') {
        // buscarFeed já salva no cache e, sem rede, devolve a cópia do aparelho.
        const r = await buscarFeed(usuarioId);
        if (!atual()) return;
        setPosts(r.posts);
        setOffline(r.offline ? { atualizado: r.atualizado } : null);
      } else {
        try {
          const meus = await buscarPosts(usuarioId, { autorId: usuarioId });
          if (!atual()) return;
          setPosts(meus);
          setOffline(null);
        } catch (e) {
          // Sem rede na aba Minhas: usa os meus posts que estão no feed salvo.
          if (!ehErroDeRede(e)) throw e;
          const salvo = await lerFeed(usuarioId);
          if (!salvo) throw e;
          if (!atual()) return;
          setPosts(salvo.posts.filter((p) => p.autor_id === usuarioId));
          setOffline({ atualizado: salvo.atualizado });
        }
      }
      setErro(null);
    } catch (e) {
      if (!atual()) return;
      setErro(ehErroDeRede(e) ? PRIMEIRO_CARREGAMENTO : mensagemDeErro(e));
    } finally {
      if (atual()) {
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
    cacheJaMostrado.current = false;
    setPosts([]);
    setErro(null);
    setOffline(null);
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
      <EstadoVazio icone="chatbubbles-outline" titulo="Ainda não há publicações" mensagem="Seja a primeira pessoa a contar o que está construindo!" />
    ) : (
      <EstadoVazio icone="create-outline" titulo="Você ainda não publicou" mensagem="Use a aba Publicar para compartilhar um projeto, dúvida ou conquista." />
    );
  }

  const feed = (
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
          <CaixaPublicar />
          <AbasInternas
            abas={[
              { id: 'recentes', rotulo: 'Recentes' },
              { id: 'minhas', rotulo: 'Minhas' },
            ]}
            selecionada={aba}
            aoMudar={mudarAba}
          />
          {offline ? <BannerOffline atualizado={offline.atualizado} /> : null}
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

  // Tela larga (computador): feed no centro + coluna da comunidade à direita.
  if (tresColunas) {
    return (
      <View style={estilos.colunas}>
        {feed}
        <ColunaComunidade />
      </View>
    );
  }
  return feed;
}

const estilos = estiloTema(() => StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  colunas: { flex: 1, flexDirection: 'row', backgroundColor: cores.fundo },
  conteudo: { ...larguraLeitura, padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.lg },
}));
