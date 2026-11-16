import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { areaToque, cores, espaco } from '@/constants/tema';

type Props = {
  curtido: boolean;
  curtidas: number;
  /** true enquanto o banco não respondeu: o botão fica travado (evita toque duplo). */
  ocupado: boolean;
  aoPressionar: () => void;
};

// Botão de curtir. Anuncia ao leitor de tela o estado (selecionado ou não)
// e o total, por exemplo: "Descurtir, 3 curtidas".
export function BotaoCurtir({ curtido, curtidas, ocupado, aoPressionar }: Props) {
  const total = curtidas === 1 ? '1 curtida' : `${curtidas} curtidas`;
  return (
    <Pressable
      onPress={aoPressionar}
      disabled={ocupado}
      accessibilityRole="button"
      accessibilityLabel={`${curtido ? 'Descurtir' : 'Curtir'}, ${total}`}
      accessibilityState={{ selected: curtido, disabled: ocupado, busy: ocupado }}
      style={[estilos.botao, curtido && estilos.ativo, ocupado && estilos.ocupado]}
    >
      <Ionicons name={curtido ? 'heart' : 'heart-outline'} size={20} color={curtido ? cores.destaqueTexto : cores.primaria} />
      <Text style={[estilos.texto, curtido && estilos.textoAtivo]}>
        {curtido ? 'Curtido' : 'Curtir'} · {curtidas}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: areaToque,
    minWidth: areaToque,
    paddingHorizontal: espaco.md,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cores.borda,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  ativo: { borderColor: cores.destaque, backgroundColor: '#FDEEE4' },
  ocupado: { opacity: 0.5 },
  texto: { fontSize: 14, fontWeight: '700', color: cores.primaria },
  textoAtivo: { color: cores.destaqueTexto },
});
