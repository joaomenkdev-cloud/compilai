import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EtiquetaTipo } from '@/components/EtiquetaTipo';
import { cores, espaco, estiloTema, familia, fonte, raio, sombra } from '@/constants/tema';
import { buscarDestaques, type Destaque } from '@/services/postService';

// "Destaques da semana": os posts mais curtidos dos últimos 7 dias
// (view destaques_semana no banco, que respeita o RLS). Recarrega ao voltar para a tela.
export function ListaDestaques({ compacta = false }: { compacta?: boolean }) {
  const router = useRouter();
  const [destaques, setDestaques] = useState<Destaque[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      buscarDestaques()
        .then(setDestaques)
        .catch(() => setDestaques([]));
    }, []),
  );

  return (
    <View style={[estilos.cartao, sombra.card]}>
      <View style={estilos.titulo}>
        <Ionicons name="flame" size={18} color={cores.destaque} />
        <Text style={estilos.rotulo}>DESTAQUES DA SEMANA</Text>
      </View>
      {destaques === null ? (
        <Text style={estilos.vazio}>Carregando…</Text>
      ) : destaques.length === 0 ? (
        <Text style={estilos.vazio}>Ainda sem destaques: curta as publicações que você achar boas!</Text>
      ) : (
        destaques.map((d, i) => (
          <Pressable
            key={d.id}
            onPress={() => router.push({ pathname: '/post/[id]', params: { id: d.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1}º lugar: ${d.autor_nome}, ${d.curtidas} ${d.curtidas === 1 ? 'curtida' : 'curtidas'}: ${d.texto}`}
            style={({ pressed }) => [estilos.item, pressed && { backgroundColor: cores.superficieSuave }]}
          >
            <Text style={[estilos.posicao, i === 0 && { color: cores.destaque }]}>{i + 1}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={estilos.texto} numberOfLines={compacta ? 1 : 2}>
                {d.texto.replace(/```[\s\S]*?(```|$)/g, '[código]')}
              </Text>
              <View style={estilos.linha}>
                <Text style={estilos.autor}>{d.autor_nome}</Text>
                {compacta ? null : <EtiquetaTipo tipo={d.tipo} />}
              </View>
            </View>
            <View style={estilos.curtidas}>
              <Ionicons name="heart" size={14} color={cores.destaque} />
              <Text style={estilos.numero}>{d.curtidas}</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    cartao: { backgroundColor: cores.superficie, borderRadius: raio.card, padding: espaco.lg, gap: espaco.sm },
    titulo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: espaco.xs },
    rotulo: { ...fonte.sobrancelha, color: cores.textoSuave },
    vazio: { ...fonte.corpo, fontSize: 14, color: cores.textoSuave },
    item: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaco.md,
      padding: espaco.sm,
      borderRadius: raio.campo,
    },
    posicao: { fontFamily: familia.titulo, fontSize: 20, width: 20, textAlign: 'center', color: cores.textoSuave },
    texto: { fontFamily: familia.medio, fontSize: 14, lineHeight: 20, color: cores.texto },
    linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexWrap: 'wrap' },
    autor: { ...fonte.pequena, fontSize: 12, color: cores.textoSuave },
    curtidas: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    numero: { fontFamily: familia.negrito, fontSize: 13, color: cores.texto },
  }),
);
