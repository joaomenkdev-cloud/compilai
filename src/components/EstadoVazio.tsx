import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, raio } from '@/constants/tema';

type Props = {
  titulo: string;
  mensagem?: string;
  icone?: keyof typeof Ionicons.glyphMap;
};

// Estado "sem conteúdo" (feed vazio, busca sem resultado etc.), sempre com texto.
export function EstadoVazio({ titulo, mensagem, icone = 'sparkles-outline' }: Props) {
  return (
    <View style={estilos.caixa} accessible accessibilityLabel={mensagem ? `${titulo}. ${mensagem}` : titulo}>
      <View style={estilos.circulo}>
        <Ionicons name={icone} size={28} color={cores.primaria} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      {mensagem ? <Text style={estilos.mensagem}>{mensagem}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    paddingVertical: espaco.xxl,
    paddingHorizontal: espaco.xl,
    borderRadius: raio.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: cores.borda,
    gap: espaco.sm,
    alignItems: 'center',
  },
  circulo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.xs,
  },
  titulo: { ...fonte.subtitulo, color: cores.primaria, textAlign: 'center' },
  mensagem: { ...fonte.corpo, color: cores.textoSuave, textAlign: 'center' },
});
