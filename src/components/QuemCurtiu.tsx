import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Folha } from '@/components/Folha';
import { areaToque, cores, espaco, estiloTema, familia, fonte, pressionado } from '@/constants/tema';
import { tempoRelativo } from '@/lib/datas';
import { mensagemDeErro } from '@/lib/erros';
import { listarCurtidas, type Curtida } from '@/services/likeService';

// "Ver quem curtiu" (no detalhe do post): abre uma folha com as pessoas que curtiram.
export function QuemCurtiu({ postId, curtidas }: { postId: string; curtidas: number }) {
  const router = useRouter();
  const [aberta, setAberta] = useState(false);
  const [lista, setLista] = useState<Curtida[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (curtidas === 0) return null;

  function abrir() {
    setAberta(true);
    setLista(null);
    setErro(null);
    listarCurtidas(postId)
      .then(setLista)
      .catch((e) => setErro(mensagemDeErro(e)));
  }

  function abrirPerfil(id: string) {
    setAberta(false);
    router.push({ pathname: '/pessoa/[id]', params: { id } });
  }

  return (
    <>
      <Pressable
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel="Ver quem curtiu"
        hitSlop={8}
        style={({ pressed }) => [estilos.gatilho, pressed && pressionado]}
      >
        <Text style={estilos.textoGatilho}>Ver quem curtiu</Text>
      </Pressable>

      <Folha visivel={aberta} aoFechar={() => setAberta(false)} titulo="Quem curtiu">
        {erro ? (
          <Text style={estilos.mensagem}>{erro}</Text>
        ) : lista === null ? (
          <ActivityIndicator color={cores.primaria} style={{ paddingVertical: espaco.lg }} />
        ) : lista.length === 0 ? (
          <Text style={estilos.mensagem}>Ninguém curtiu ainda.</Text>
        ) : (
          <ScrollView style={estilos.rolagem}>
            {lista.map((c) => (
              <Pressable
                key={c.autor_id}
                onPress={() => abrirPerfil(c.autor_id)}
                accessibilityRole="link"
                accessibilityLabel={`${c.nome}, curtiu ${tempoRelativo(c.criado_em)}. Abrir perfil`}
                style={({ pressed }) => [estilos.linha, pressed && pressionado]}
              >
                <Avatar nome={c.nome} />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nome}>{c.nome}</Text>
                  <Text style={estilos.data}>{tempoRelativo(c.criado_em)}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Folha>
    </>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    gatilho: { minHeight: areaToque, justifyContent: 'center', paddingHorizontal: espaco.sm },
    textoGatilho: { fontFamily: familia.negrito, fontSize: 14, color: cores.primaria, textDecorationLine: 'underline' },
    rolagem: { maxHeight: 360 },
    linha: { minHeight: areaToque + 8, flexDirection: 'row', alignItems: 'center', gap: espaco.md, paddingVertical: espaco.xs },
    nome: { fontFamily: familia.negrito, fontSize: 15, color: cores.texto },
    data: { ...fonte.pequena, color: cores.textoSuave },
    mensagem: { ...fonte.corpo, color: cores.textoSuave, paddingVertical: espaco.md },
  }),
);
