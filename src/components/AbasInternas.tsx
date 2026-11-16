import { Pressable, StyleSheet, Text, View } from 'react-native';

import { areaToque, cores, espaco, raio } from '@/constants/tema';

type Aba<T extends string> = { id: T; rotulo: string };

type Props<T extends string> = {
  abas: Aba<T>[];
  selecionada: T;
  aoMudar: (id: T) => void;
};

// Abas internas em pílula: dois botões + estado local (guardado pela tela).
// Cada botão anuncia ao leitor de tela se está selecionado.
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
            style={[estilos.aba, ativa && estilos.abaAtiva]}
          >
            <Text style={[estilos.texto, ativa && estilos.textoAtivo]}>{aba.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    backgroundColor: cores.pilula,
    borderRadius: raio.pilula,
    padding: 4,
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
  abaAtiva: { backgroundColor: cores.primaria },
  texto: { fontSize: 15, fontWeight: '600', color: cores.primaria },
  textoAtivo: { color: cores.sobrePrimaria },
});
