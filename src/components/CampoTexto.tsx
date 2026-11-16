import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cores, espaco, familia, fonte, raio } from '@/constants/tema';

type Props = TextInputProps & {
  /** Rótulo sempre visível (não só placeholder). */
  rotulo: string;
  /** Mensagem de erro mostrada logo abaixo do campo. */
  erro?: string | null;
};

// Campo de texto com rótulo persistente, borda de foco e erro junto ao campo.
// Campos de senha ganham o botão "mostrar/ocultar".
export function CampoTexto({ rotulo, erro, style, secureTextEntry, onFocus, onBlur, ...resto }: Props) {
  const [focado, setFocado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const ehSenha = !!secureTextEntry;

  return (
    <View style={estilos.caixa}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={[estilos.moldura, focado && estilos.molduraFoco, erro ? estilos.molduraErro : null]}>
        <TextInput
          accessibilityLabel={rotulo}
          placeholderTextColor={cores.textoSuave}
          secureTextEntry={ehSenha && !senhaVisivel}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          style={[estilos.campo, style]}
          {...resto}
        />
        {ehSenha ? (
          <Pressable
            onPress={() => setSenhaVisivel((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={8}
            style={estilos.olho}
          >
            <Ionicons name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'} size={22} color={cores.textoSuave} />
          </Pressable>
        ) : null}
      </View>
      {erro ? (
        <View style={estilos.linhaErro} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={16} color={cores.erro} />
          <Text style={estilos.erro}>{erro}</Text>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { gap: 6 },
  rotulo: { ...fonte.rotulo, color: cores.texto },
  moldura: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.campo,
    backgroundColor: cores.superficie,
  },
  molduraFoco: { borderColor: cores.primaria, borderWidth: 2 },
  molduraErro: { borderColor: cores.erro },
  campo: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: espaco.md,
    fontFamily: familia.regular,
    fontSize: 16,
    color: cores.texto,
  },
  olho: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  linhaErro: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  erro: { ...fonte.pequena, fontFamily: familia.medio, color: cores.erro, flex: 1 },
});
