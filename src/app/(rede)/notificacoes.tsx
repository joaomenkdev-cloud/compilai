import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Carregando } from '@/components/Carregando';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { areaToque, cores, espaco, fonte, raio, familia, sombra } from '@/constants/tema';
import { useAvisos } from '@/contexts/AvisosProvider';
import { tempoRelativo } from '@/lib/datas';
import { mensagemDeErro } from '@/lib/erros';
import { listarAvisos, marcarComoLido, type Aviso } from '@/services/notificationService';

function frase(aviso: Aviso) {
  return aviso.tipo === 'curtida'
    ? `${aviso.ator_nome} curtiu sua publicação`
    : `${aviso.ator_nome} comentou na sua publicação`;
}

export default function Notificacoes() {
  const router = useRouter();
  const { recarregar: recarregarContador } = useAvisos();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const abrindo = useRef(false);

  const carregar = useCallback(async () => {
    try {
      setAvisos(await listarAvisos());
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
    recarregarContador();
  }, [recarregarContador]);

  // Ao entrar na tela (inclusive voltando do post), consulta os avisos de novo.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function abrir(aviso: Aviso) {
    if (abrindo.current) return;
    abrindo.current = true;
    try {
      if (!aviso.lida_em) {
        // 1) grava lida_em no banco; 2) atualiza a lista e o contador do menu.
        const lidaEm = await marcarComoLido(aviso.id);
        setAvisos((lista) => lista.map((a) => (a.id === aviso.id ? { ...a, lida_em: lidaEm } : a)));
        recarregarContador();
      }
    } catch {
      // Se não conseguir marcar (ex.: sem rede), abre o post mesmo assim; o aviso segue como novo.
    } finally {
      abrindo.current = false;
    }
    // 3) abre exatamente a publicação que originou o aviso.
    router.push({ pathname: '/post/[id]', params: { id: aviso.post_id } });
  }

  const novas = avisos.filter((a) => !a.lida_em);
  const anteriores = avisos.filter((a) => a.lida_em);
  const secoes = [
    { titulo: 'Novas', data: novas },
    { titulo: 'Anteriores', data: anteriores },
  ];

  if (carregando) {
    return (
      <View style={estilos.fundo}>
        <Carregando texto="Carregando avisos…" />
      </View>
    );
  }

  return (
    <SectionList
      style={estilos.fundo}
      contentContainerStyle={estilos.conteudo}
      sections={avisos.length > 0 ? secoes : []}
      keyExtractor={(a) => a.id}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <CabecalhoTela secao="Notificações" titulo="Avisos" />
          {erro ? <EstadoErro mensagem={erro} aoTentarDeNovo={carregar} /> : null}
        </View>
      }
      ListEmptyComponent={
        erro ? undefined : (
          <EstadoVazio
            icone="notifications-outline"
            titulo="Nenhum aviso ainda"
            mensagem="Quando alguém curtir ou comentar suas publicações, o aviso aparece aqui."
          />
        )
      }
      renderSectionHeader={({ section }) => (
        <Text style={estilos.tituloSecao} accessibilityRole="header">
          {section.titulo} ({section.data.length})
        </Text>
      )}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? (
          <Text style={estilos.secaoVazia}>
            {section.titulo === 'Novas' ? 'Nada novo por aqui.' : 'Nenhum aviso lido ainda.'}
          </Text>
        ) : null
      }
      ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
      renderItem={({ item }) => {
        const naoLida = !item.lida_em;
        return (
          <Pressable
            onPress={() => abrir(item)}
            accessibilityRole="button"
            accessibilityLabel={`${naoLida ? 'Não lida. ' : ''}${frase(item)}: ${item.trecho}. ${tempoRelativo(item.criado_em)}`}
            accessibilityHint="Abre a publicação"
            style={({ pressed }) => [estilos.aviso, naoLida && estilos.avisoNovo, pressed && estilos.pressionado]}
          >
            {/* Não lida = marcador + rótulo em texto, não só cor. */}
            <View style={[estilos.marcador, naoLida ? estilos.marcadorNovo : estilos.marcadorLido]} />
            <View style={[estilos.circuloIcone, item.tipo === 'curtida' ? estilos.circuloCurtida : estilos.circuloComentario]}>
              <Ionicons
                name={item.tipo === 'curtida' ? 'heart' : 'chatbubble'}
                size={20}
                color={item.tipo === 'curtida' ? cores.destaque : cores.primaria}
              />
            </View>
            <View style={estilos.corpo}>
              {naoLida ? <Text style={estilos.etiqueta}>Não lida</Text> : null}
              <Text style={[estilos.frase, naoLida && estilos.fraseNova]}>{frase(item)}</Text>
              {item.trecho ? (
                <Text style={estilos.trecho} numberOfLines={2}>
                  “{item.trecho}”
                </Text>
              ) : null}
              <Text style={estilos.data}>{tempoRelativo(item.criado_em)}</Text>
            </View>
          </Pressable>
        );
      }}
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
  cabecalho: { gap: espaco.lg, marginBottom: espaco.sm },
  tituloSecao: { ...fonte.subtitulo, color: cores.primaria, marginTop: espaco.lg, marginBottom: espaco.sm },
  secaoVazia: { ...fonte.corpo, color: cores.textoSuave, fontStyle: 'italic' },
  aviso: {
    minHeight: areaToque + 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    ...sombra.card,
  },
  avisoNovo: { borderColor: cores.destaque, borderWidth: 1.5, backgroundColor: '#FFF9F4' },
  circuloIcone: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  circuloCurtida: { backgroundColor: cores.destaqueClaro },
  circuloComentario: { backgroundColor: cores.primariaClara },
  pressionado: { opacity: 0.8 },
  marcador: { width: 10, height: 10, borderRadius: 5 },
  marcadorNovo: { backgroundColor: cores.destaque },
  marcadorLido: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: cores.borda },
  corpo: { flex: 1, gap: 2 },
  etiqueta: {
    alignSelf: 'flex-start',
    ...fonte.sobrancelha,
    fontSize: 11,
    color: cores.sobrePrimaria,
    backgroundColor: cores.destaqueTexto,
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  frase: { ...fonte.corpo, color: cores.texto },
  fraseNova: { fontFamily: familia.negrito },
  trecho: { ...fonte.pequena, color: cores.textoSuave },
  data: { ...fonte.pequena, color: cores.textoSuave },
});
