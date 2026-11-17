import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { areaToque, cores, espaco, familia, pressionado, estiloTema } from '@/constants/tema';

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
      style={({ pressed }) => [
        estilos.botao,
        curtido && estilos.ativo,
        ocupado && estilos.ocupado,
        pressed && !ocupado && pressionado,
      ]}
    >
      <Ionicons
        name={curtido ? 'heart' : 'heart-outline'}
        size={20}
        color={curtido ? cores.destaque : cores.textoSuave}
      />
      <Text style={[estilos.texto, curtido && estilos.textoAtivo]}>
        {curtido ? 'Curtido' : 'Curtir'} · {curtidas}
      </Text>
    </Pressable>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  botao: {
    minHeight: areaToque,
    minWidth: areaToque,
    paddingHorizontal: espaco.md,
    borderRadius: 999,
    backgroundColor: cores.superficieSuave,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ativo: { backgroundColor: cores.destaqueClaro },
  ocupado: { opacity: 0.5 },
  texto: { fontFamily: familia.medio, fontSize: 14, color: cores.texto },
  textoAtivo: { fontFamily: familia.negrito, color: cores.destaqueTexto },
}));
