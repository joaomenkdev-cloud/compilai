import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, raio } from '@/constants/tema';

type Props = { titulo: string; mensagem?: string };

// Estado "sem conteúdo" (feed vazio, busca sem resultado etc.), sempre com texto.
export function EstadoVazio({ titulo, mensagem }: Props) {
  return (
    <View style={estilos.caixa} accessibilityRole="text">
      <Text style={estilos.titulo}>{titulo}</Text>
      {mensagem ? <Text style={estilos.mensagem}>{mensagem}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    padding: espaco.xl,
    borderRadius: raio.card,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: espaco.sm,
    alignItems: 'center',
  },
  titulo: { ...fonte.subtitulo, color: cores.primaria, textAlign: 'center' },
  mensagem: { ...fonte.corpo, color: cores.textoSuave, textAlign: 'center' },
});
