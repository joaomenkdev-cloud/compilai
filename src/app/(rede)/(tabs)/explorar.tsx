import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AbasInternas } from '@/components/AbasInternas';
import { Avatar } from '@/components/Avatar';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Carregando } from '@/components/Carregando';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { PostCard } from '@/components/PostCard';
import { areaToque, cores, espaco, fonte, raio, sombra, familia, larguraLeitura } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useCurtir } from '@/hooks/useCurtir';
import { mensagemDeErro } from '@/lib/erros';
import { buscarPosts, type Post } from '@/services/postService';
import { buscarPessoas, type Perfil } from '@/services/profileService';

type AbaExplorar = 'pessoas' | 'posts';

export default function Explorar() {
  const router = useRouter();
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const [aba, setAba] = useState<AbaExplorar>('pessoas');
  const [termo, setTermo] = useState('');
  // Termo que gerou os resultados atuais (o campo continua editável enquanto isso).
  const [termoBuscado, setTermoBuscado] = useState<string | null>(null);
  const [pessoas, setPessoas] = useState<Perfil[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ultimaBusca = useRef(0);
  // Busca automática: espera 400 ms sem digitar antes de consultar o banco
  // (evita uma consulta por letra digitada).
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function aoDigitar(texto: string) {
    setTermo(texto);
    if (temporizador.current) clearTimeout(temporizador.current);
    if (!texto.trim()) {
      // Campo vazio: volta ao estado inicial ("Digite um termo...").
      ultimaBusca.current++;
      setPessoas([]);
      setPosts([]);
      setTermoBuscado(null);
      setBuscando(false);
      setErro(null);
      return;
    }
    temporizador.current = setTimeout(() => buscar(aba, texto), 400);
  }

  async function buscar(abaAlvo: AbaExplorar = aba, termoAlvo: string = termo) {
    if (temporizador.current) clearTimeout(temporizador.current);
    const limpo = termoAlvo.trim();
    if (!usuarioId || limpo.length === 0) return;
    const numero = ++ultimaBusca.current;
    setBuscando(true);
    setErro(null);
    try {
      if (abaAlvo === 'pessoas') {
        const r = await buscarPessoas(limpo);
        if (numero === ultimaBusca.current) setPessoas(r);
      } else {
        const r = await buscarPosts(usuarioId, { termo: limpo });
        if (numero === ultimaBusca.current) setPosts(r);
      }
      if (numero === ultimaBusca.current) setTermoBuscado(limpo);
    } catch (e) {
      if (numero === ultimaBusca.current) setErro(mensagemDeErro(e));
    } finally {
      if (numero === ultimaBusca.current) setBuscando(false);
    }
  }

  function mudarAba(nova: AbaExplorar) {
    if (nova === aba) return;
    setAba(nova);
    setPessoas([]);
    setPosts([]);
    setTermoBuscado(null);
    // Se já havia um termo, repete a busca na nova aba.
    if (termo.trim()) buscar(nova, termo);
  }

  const atualizarPost = useCallback(
    (novo: Post) => setPosts((lista) => lista.map((p) => (p.id === novo.id ? novo : p))),
    [],
  );
  const { curtindo, alternar } = useCurtir(usuarioId, atualizarPost);

  const cabecalho = (
    <View style={estilos.cabecalho}>
      <CabecalhoTela secao="Explorar" titulo="Descobrir" />
      <AbasInternas
        abas={[
          { id: 'pessoas', rotulo: 'Pessoas' },
          { id: 'posts', rotulo: 'Posts' },
        ]}
        selecionada={aba}
        aoMudar={mudarAba}
      />
      <View style={estilos.caixaBusca}>
        <Text style={estilos.rotulo}>{aba === 'pessoas' ? 'Buscar pessoas pelo nome' : 'Buscar posts pelo texto'}</Text>
        <View style={estilos.linhaBusca}>
          <TextInput
            value={termo}
            onChangeText={aoDigitar}
            onSubmitEditing={() => buscar()}
            returnKeyType="search"
            placeholder={aba === 'pessoas' ? 'Ex.: Bia' : 'Ex.: React Native'}
            placeholderTextColor={cores.textoSuave}
            accessibilityLabel={aba === 'pessoas' ? 'Buscar pessoas pelo nome' : 'Buscar posts pelo texto'}
            autoCapitalize="none"
            style={estilos.campo}
          />
          <Pressable
            onPress={() => buscar()}
            disabled={buscando || termo.trim().length === 0}
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            accessibilityState={{ disabled: buscando || termo.trim().length === 0 }}
            style={[estilos.botaoBusca, (buscando || !termo.trim()) && estilos.inativo]}
          >
            <Ionicons name="search" size={22} color={cores.sobrePrimaria} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  function vazio() {
    if (buscando) return <Carregando texto="Buscando…" />;
    if (erro) return <EstadoErro mensagem={erro} aoTentarDeNovo={() => buscar()} />;
    if (termoBuscado === null) {
      return (
        <EstadoVazio
          icone={aba === 'pessoas' ? 'people-outline' : 'search-outline'}
          titulo={aba === 'pessoas' ? 'Encontre colegas' : 'Encontre publicações'}
          mensagem="Digite um termo e toque na lupa."
        />
      );
    }
    return <EstadoVazio icone="file-tray-outline" titulo="Nenhum resultado" mensagem={`Nada encontrado para "${termoBuscado}". Ajuste o termo e tente de novo.`} />;
  }

  if (aba === 'pessoas') {
    return (
      <FlatList
        style={estilos.fundo}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        data={pessoas}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={vazio()}
        ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
        renderItem={({ item }) => (
          <Pressable
            // Abre o perfil PELO ID da pessoa selecionada.
            onPress={() => router.push({ pathname: '/pessoa/[id]', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Abrir perfil de ${item.nome}`}
            style={({ pressed }) => [estilos.pessoa, pressed && estilos.pressionado]}
          >
            <Avatar nome={item.nome} />
            <View style={estilos.textoPessoa}>
              <Text style={estilos.nomePessoa}>{item.nome}</Text>
              {item.bio ? (
                <Text style={estilos.bio} numberOfLines={2}>
                  {item.bio}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
          </Pressable>
        )}
      />
    );
  }

  return (
    <FlatList
      style={estilos.fundo}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
      data={posts}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={vazio()}
      ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
      renderItem={({ item }) => <PostCard post={item} curtindo={curtindo.has(item.id)} aoCurtir={alternar} />}
    />
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { ...larguraLeitura, padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.lg },
  caixaBusca: { gap: espaco.xs },
  rotulo: { ...fonte.rotulo, color: cores.texto },
  linhaBusca: { flexDirection: 'row', gap: espaco.sm },
  campo: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.campo,
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.md,
    fontFamily: familia.regular,
    fontSize: 16,
    color: cores.texto,
  },
  botaoBusca: {
    width: 48,
    minHeight: 48,
    borderRadius: raio.campo,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inativo: { opacity: 0.5 },
  pessoa: {
    minHeight: areaToque + 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    ...sombra.card,
  },
  pressionado: { opacity: 0.8 },
  textoPessoa: { flex: 1, gap: 2 },
  nomePessoa: { ...fonte.subtitulo, fontSize: 16, color: cores.primaria },
  bio: { ...fonte.pequena, color: cores.textoSuave },
});
