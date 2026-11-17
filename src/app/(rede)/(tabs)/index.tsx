import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AbasInternas } from '@/components/AbasInternas';
import { BannerOffline } from '@/components/BannerOffline';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CaixaPublicar } from '@/components/CaixaPublicar';
import { FaixaNovidades } from '@/components/FaixaNovidades';
import { ColunaComunidade } from '@/components/ColunaComunidade';
import { Carregando } from '@/components/Carregando';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { PostCard } from '@/components/PostCard';
import { cores, espaco, fonte, larguraLeitura, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useCurtir } from '@/hooks/useCurtir';
import { useNovasPublicacoes } from '@/hooks/useNovasPublicacoes';
import { useLayout } from '@/hooks/useLayout';
import { ehErroDeRede, mensagemDeErro } from '@/lib/erros';
import { buscarFeed, buscarPosts, LIMITE_FEED, type Post } from '@/services/postService';
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
  // Rolagem infinita: a primeira página vem do carregar(); as próximas, do carregarMais().
  const [temMais, setTemMais] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erroMais, setErroMais] = useState(false);

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
        setTemMais(!r.offline && r.posts.length >= LIMITE_FEED);
      } else {
        try {
          const meus = await buscarPosts(usuarioId, { autorId: usuarioId });
          if (!atual()) return;
          setPosts(meus);
          setOffline(null);
          setTemMais(meus.length >= LIMITE_FEED);
        } catch (e) {
          // Sem rede na aba Minhas: usa os meus posts que estão no feed salvo.
          if (!ehErroDeRede(e)) throw e;
          const salvo = await lerFeed(usuarioId);
          if (!salvo) throw e;
          if (!atual()) return;
          setPosts(salvo.posts.filter((p) => p.autor_id === usuarioId));
          setOffline({ atualizado: salvo.atualizado });
          setTemMais(false);
        }
      }
      setErro(null);
      setErroMais(false);
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

  // Próxima página: posts mais antigos que o último da lista.
  const carregarMais = useCallback(async () => {
    if (!usuarioId || !temMais || carregandoMais || offline || posts.length === 0) return;
    const numero = ultimaBusca.current; // se o feed recarregar no meio, descarta esta página
    setCarregandoMais(true);
    try {
      const antesDe = posts[posts.length - 1].criado_em;
      const pagina = await buscarPosts(usuarioId, { antesDe, autorId: aba === 'minhas' ? usuarioId : undefined });
      if (numero !== ultimaBusca.current) return;
      setPosts((lista) => {
        const ja = new Set(lista.map((p) => p.id));
        return [...lista, ...pagina.filter((p) => !ja.has(p.id))];
      });
      setTemMais(pagina.length >= LIMITE_FEED);
      setErroMais(false);
    } catch {
      if (numero === ultimaBusca.current) setErroMais(true);
    } finally {
      setCarregandoMais(false);
    }
  }, [usuarioId, temMais, carregandoMais, offline, posts, aba]);

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
    setTemMais(false);
    setErroMais(false);
    setCarregando(true);
    setAba(nova);
  }

  // Tempo real: conta posts novos de outras pessoas enquanto o feed está aberto.
  const { novas, limpar } = useNovasPublicacoes(usuarioId);
  const lista = useRef<FlatList<Post>>(null);
  function verNovas() {
    limpar();
    lista.current?.scrollToOffset({ offset: 0, animated: true });
    if (aba !== 'recentes') mudarAba('recentes');
    else carregar();
  }

  function puxarParaAtualizar() {
    setAtualizando(true);
    carregar();
  }

  const atualizarPost = useCallback(
    (novo: Post) => setPosts((lista) => lista.map((p) => (p.id === novo.id ? novo : p))),
    [],
  );
  const removerPost = useCallback((id: string) => setPosts((lista) => lista.filter((p) => p.id !== id)), []);
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

  function rodape() {
    if (posts.length === 0) return null;
    if (carregandoMais) {
      return (
        <View style={estilos.rodape} accessibilityLiveRegion="polite">
          <ActivityIndicator color={cores.primaria} />
          <Text style={estilos.textoRodape}>Carregando mais…</Text>
        </View>
      );
    }
    if (erroMais) {
      return (
        <View style={estilos.rodape}>
          <EstadoErro mensagem="Não deu para carregar mais publicações." aoTentarDeNovo={carregarMais} />
        </View>
      );
    }
    if (!temMais && !offline && posts.length >= LIMITE_FEED) {
      return (
        <View style={estilos.rodape}>
          <Text style={estilos.textoRodape}>Você chegou ao começo da comunidade 🎉</Text>
        </View>
      );
    }
    return null;
  }

  const feed = (
    <FlatList
      ref={lista}
      style={estilos.fundo}
      contentContainerStyle={estilos.conteudo}
      data={posts}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => <PostCard post={item} curtindo={curtindo.has(item.id)} aoCurtir={alternar} aoAtualizar={atualizarPost} aoRemover={removerPost} />}
      ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <CabecalhoTela secao="Início" titulo="Comunidade" />
          <CaixaPublicar />
          {novas > 0 ? <FaixaNovidades quantidade={novas} aoPressionar={verNovas} /> : null}
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
      ListFooterComponent={rodape() ?? undefined}
      onEndReached={carregarMais}
      onEndReachedThreshold={0.5}
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
  rodape: { alignItems: 'center', gap: espaco.sm, paddingTop: espaco.lg },
  textoRodape: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'center' },
}));
