import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, estiloTema, familia } from '@/constants/tema';
import type { TipoPost } from '@/services/postService';

type Icone = keyof typeof Ionicons.glyphMap;

/** Visual de cada tipo: ícone + texto (a cor nunca é a única informação). */
export function infoTipo(tipo: TipoPost): { rotulo: string; icone: Icone; cor: string; fundo: string } {
  switch (tipo) {
    case 'duvida':
      return { rotulo: 'Dúvida', icone: 'help-circle', cor: cores.destaqueTexto, fundo: cores.destaqueClaro };
    case 'conquista':
      return { rotulo: 'Conquista', icone: 'trophy', cor: cores.sucesso, fundo: cores.sucessoClaro };
    default:
      return { rotulo: 'Projeto', icone: 'construct', cor: cores.primaria, fundo: cores.primariaClara };
  }
}

// Etiqueta pequena do tipo da publicação ("Projeto", "Dúvida", "Conquista").
// Em dúvidas resolvidas vira "Resolvida" (verde, com ✔).
export function EtiquetaTipo({ tipo, resolvida = false }: { tipo: TipoPost; resolvida?: boolean }) {
  const info =
    tipo === 'duvida' && resolvida
      ? { rotulo: 'Resolvida', icone: 'checkmark-circle' as Icone, cor: cores.sucesso, fundo: cores.sucessoClaro }
      : infoTipo(tipo);
  return (
    <View
      style={[estilos.etiqueta, { backgroundColor: info.fundo }]}
      accessible
      accessibilityLabel={tipo === 'duvida' && resolvida ? 'Dúvida resolvida' : info.rotulo}
    >
      <Ionicons name={info.icone} size={14} color={info.cor} />
      <Text style={[estilos.texto, { color: info.cor }]}>{info.rotulo}</Text>
    </View>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    etiqueta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: espaco.sm,
      paddingVertical: 4,
      borderRadius: 999,
      alignSelf: 'flex-start',
    },
    texto: { fontFamily: familia.negrito, fontSize: 12 },
  }),
);
