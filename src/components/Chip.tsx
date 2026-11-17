import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { cores, espaco, estiloTema, familia } from '@/constants/tema';

type Props = {
  rotulo: string;
  /** Com seleção: vira um botão de marcar/desmarcar (checkbox). */
  selecionado?: boolean;
  /** Sem seleção e com ação: vira um link (ex.: abrir "quem também usa"). */
  aoPressionar?: () => void;
  desativado?: boolean;
  /** Mostra um "×" para remover. */
  removivel?: boolean;
  rotuloAcessivel?: string;
};

// Etiqueta pequena (stack, área). Pode ser só informativa, um botão de marcar ou um link.
export function Chip({ rotulo, selecionado, aoPressionar, desativado = false, removivel = false, rotuloAcessivel }: Props) {
  const ehEscolha = selecionado !== undefined;
  const conteudo = (
    <>
      {ehEscolha && selecionado ? <Ionicons name="checkmark" size={14} color={cores.sobrePrimaria} /> : null}
      <Text style={[estilos.texto, selecionado && estilos.textoSelecionado]}>{rotulo}</Text>
      {removivel ? <Ionicons name="close" size={14} color={selecionado ? cores.sobrePrimaria : cores.textoSuave} /> : null}
    </>
  );

  if (!aoPressionar) {
    return <Text style={[estilos.chip, estilos.estatico]}>{rotulo}</Text>;
  }

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={desativado}
      accessibilityRole={ehEscolha ? 'checkbox' : 'link'}
      accessibilityLabel={rotuloAcessivel ?? rotulo}
      accessibilityState={ehEscolha ? { checked: selecionado, disabled: desativado } : { disabled: desativado }}
      aria-checked={ehEscolha ? selecionado : undefined}
      hitSlop={4}
      style={({ pressed }) => [
        estilos.chip,
        selecionado && estilos.selecionado,
        desativado && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
      ]}
    >
      {conteudo}
    </Pressable>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    chip: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: espaco.md,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: cores.borda,
      backgroundColor: cores.superficie,
      overflow: 'hidden',
    },
    estatico: { fontFamily: familia.medio, fontSize: 13, color: cores.texto, backgroundColor: cores.superficieSuave },
    selecionado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
    texto: { fontFamily: familia.medio, fontSize: 13, color: cores.texto },
    textoSelecionado: { color: cores.sobrePrimaria, fontFamily: familia.negrito },
  }),
);
