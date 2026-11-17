import { Pressable, StyleSheet, Text, View } from 'react-native';

import { areaToque, cores, espaco, familia, raio, sombra, estiloTema } from '@/constants/tema';

type Aba<T extends string> = { id: T; rotulo: string };

type Props<T extends string> = {
  abas: Aba<T>[];
  selecionada: T;
  aoMudar: (id: T) => void;
};

// Abas internas em pílula: dois botões + estado local (guardado pela tela).
// A selecionada vira uma "pílula" branca elevada; cada botão anuncia ao leitor
// de tela se está selecionado.
export function AbasInternas<T extends string>({ abas, selecionada, aoMudar }: Props<T>) {
  return (
    <View style={estilos.trilho} accessibilityRole="tablist">
      {abas.map((aba) => {
        const ativa = aba.id === selecionada;
        return (
          <Pressable
            key={aba.id}
            onPress={() => aoMudar(aba.id)}
            accessibilityRole="tab"
            accessibilityLabel={aba.rotulo}
            accessibilityState={{ selected: ativa }}
            style={[estilos.aba, ativa && [estilos.abaAtiva, sombra.card]]}
          >
            <Text style={[estilos.texto, ativa && estilos.textoAtivo]}>{aba.rotulo}</Text>
            {/* Marcador sob o texto: o estado não depende só da cor. */}
            {ativa ? <View style={estilos.marcador} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    backgroundColor: cores.superficieSuave,
    borderRadius: raio.pilula,
    padding: 5,
    gap: 4,
  },
  aba: {
    flex: 1,
    minHeight: areaToque,
    borderRadius: raio.pilula,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaco.md,
  },
  abaAtiva: { backgroundColor: cores.superficie },
  texto: { fontFamily: familia.medio, fontSize: 15, color: cores.textoSuave },
  textoAtivo: { fontFamily: familia.negrito, color: cores.primaria },
  marcador: { width: 18, height: 3, borderRadius: 2, backgroundColor: cores.destaque, marginTop: 3 },
}));
