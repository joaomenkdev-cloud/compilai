import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cores, espaco, fonte, raio } from '@/constants/tema';

type Props = TextInputProps & {
  /** Rótulo sempre visível (não só placeholder). */
  rotulo: string;
  /** Mensagem de erro mostrada logo abaixo do campo. */
  erro?: string | null;
};

// Campo de texto com rótulo persistente e mensagem de erro junto ao campo.
export function CampoTexto({ rotulo, erro, style, ...resto }: Props) {
  return (
    <View style={estilos.caixa}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoSuave}
        style={[estilos.campo, erro ? estilos.campoComErro : null, style]}
        {...resto}
      />
      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { gap: espaco.xs },
  rotulo: { ...fonte.rotulo, color: cores.texto },
  campo: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.campo,
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.md,
    fontSize: 16,
    color: cores.texto,
  },
  campoComErro: { borderColor: cores.erro },
  erro: { ...fonte.pequena, color: cores.erro },
});
