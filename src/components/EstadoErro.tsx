import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { cores, espaco, fonte, raio } from '@/constants/tema';

type Props = { mensagem: string; aoTentarDeNovo?: () => void };

// Estado de erro com ícone + texto e, quando faz sentido, um botão para tentar de novo.
export function EstadoErro({ mensagem, aoTentarDeNovo }: Props) {
  return (
    <View style={estilos.caixa} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={estilos.linha}>
        <Ionicons name="alert-circle" size={22} color={cores.erro} />
        <Text style={estilos.titulo}>Não deu certo</Text>
      </View>
      <Text style={estilos.mensagem}>{mensagem}</Text>
      {aoTentarDeNovo ? (
        <Botao titulo="Tentar de novo" variante="secundario" icone="refresh" aoPressionar={aoTentarDeNovo} />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    padding: espaco.lg,
    borderRadius: raio.card,
    backgroundColor: cores.erroClaro,
    borderLeftWidth: 4,
    borderLeftColor: cores.erro,
    gap: espaco.sm,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  titulo: { ...fonte.subtitulo, color: cores.erro },
  mensagem: { ...fonte.corpo, color: cores.texto },
});
