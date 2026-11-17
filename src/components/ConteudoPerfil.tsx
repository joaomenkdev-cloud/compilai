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
import { cores, espaco, fonte, raio, sombra, familia, larguraLeitura, estiloTema } from '@/constants/tema';
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
      {/* Cartão de capa: faixa azul + avatar grande sobreposto. */}
      <View style={estilos.cartao}>
        <View style={estilos.capa} importantForAccessibility="no-hide-descendants">
          <View style={estilos.capaBolha} />
        </View>
        <View style={estilos.avatarMoldura}>
          <Avatar nome={perfil.nome} tamanho={80} />
        </View>
        <View style={estilos.identidade}>
          <Text style={estilos.nome} accessibilityRole="header">
            {perfil.nome}
          </Text>
          {perfil.bio ? (
            <Text style={estilos.bio} numberOfLines={2}>
              {perfil.bio}
            </Text>
          ) : null}
          <View style={estilos.chip}>
            <Text style={estilos.chipNumero}>{posts.length}</Text>
            <Text style={estilos.chipTexto}>{posts.length === 1 ? 'publicação' : 'publicações'}</Text>
          </View>
        </View>
        {ehProprio ? (
          <View style={estilos.acoes}>
            <Botao
              titulo="Editar perfil"
              icone="create-outline"
              variante="secundario"
              aoPressionar={() => router.push('/editar-perfil')}
            />
          </View>
        ) : null}
      </View>
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
        aba === 'sobre' ? sobre : <EstadoVazio icone="document-text-outline" titulo="Nenhuma publicação ainda" />
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

const estilos = estiloTema(() => StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { ...larguraLeitura, padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.lg },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    ...sombra.card,
    overflow: 'hidden',
    paddingBottom: espaco.lg,
  },
  capa: { height: 76, backgroundColor: cores.primaria, overflow: 'hidden' },
  capaBolha: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -40,
    top: -70,
    backgroundColor: cores.destaque,
    opacity: 0.9,
  },
  avatarMoldura: {
    alignSelf: 'flex-start',
    marginLeft: espaco.lg,
    marginTop: -40,
    padding: 4,
    borderRadius: 999,
    backgroundColor: cores.superficie,
  },
  identidade: { paddingHorizontal: espaco.lg, paddingTop: espaco.sm, gap: espaco.sm },
  nome: { ...fonte.titulo, fontSize: 24, lineHeight: 30, color: cores.texto },
  bio: { ...fonte.corpo, color: cores.textoSuave },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: espaco.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: cores.primariaClara,
  },
  chipNumero: { fontFamily: familia.titulo, fontSize: 16, color: cores.primaria },
  chipTexto: { ...fonte.pequena, color: cores.primaria },
  acoes: { paddingHorizontal: espaco.lg, paddingTop: espaco.md },
  caixaSobre: {
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    ...sombra.card,
    padding: espaco.lg,
    gap: espaco.xs,
  },
  rotulo: { ...fonte.sobrancelha, color: cores.destaqueTexto, marginTop: espaco.sm },
  valor: { ...fonte.corpo, color: cores.texto },
  vazio: { color: cores.textoSuave, fontStyle: 'italic' },
}));
