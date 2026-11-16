import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { cores, espaco, fonte, raio } from '@/constants/tema';

type Props = { mensagem: string; aoTentarDeNovo?: () => void };

// Estado de erro com texto e, quando faz sentido, um botão para tentar de novo.
export function EstadoErro({ mensagem, aoTentarDeNovo }: Props) {
  return (
    <View style={estilos.caixa} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={estilos.titulo}>Não deu certo</Text>
      <Text style={estilos.mensagem}>{mensagem}</Text>
      {aoTentarDeNovo ? <Botao titulo="Tentar de novo" variante="secundario" aoPressionar={aoTentarDeNovo} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    padding: espaco.xl,
    borderRadius: raio.card,
    borderWidth: 1.5,
    borderColor: cores.erro,
    backgroundColor: cores.superficie,
    gap: espaco.md,
    alignItems: 'stretch',
  },
  titulo: { ...fonte.subtitulo, color: cores.erro, textAlign: 'center' },
  mensagem: { ...fonte.corpo, color: cores.texto, textAlign: 'center' },
});
