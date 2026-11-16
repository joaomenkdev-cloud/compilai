import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { areaToque, cores, espaco, raio } from '@/constants/tema';

type Props = {
  titulo: string;
  aoPressionar: () => void;
  variante?: 'primario' | 'secundario' | 'texto';
  desativado?: boolean;
  carregando?: boolean;
  /** Se omitido, o leitor de tela lê o próprio título. */
  rotuloAcessivel?: string;
};

// Botão padrão do app. Fica desativado (e avisa o leitor de tela)
// enquanto uma requisição está em andamento.
export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  desativado = false,
  carregando = false,
  rotuloAcessivel,
}: Props) {
  const inativo = desativado || carregando;
  const corTexto = variante === 'primario' ? cores.sobrePrimaria : cores.primaria;

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        estilos.base,
        variante === 'primario' && estilos.primario,
        variante === 'secundario' && estilos.secundario,
        inativo && estilos.inativo,
        pressed && !inativo && estilos.pressionado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <Text style={[estilos.texto, { color: corTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: areaToque + 4,
    paddingHorizontal: espaco.xl,
    borderRadius: raio.campo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.primaria },
  secundario: {
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.primaria,
  },
  inativo: { opacity: 0.5 },
  pressionado: { opacity: 0.85 },
  texto: { fontSize: 16, fontWeight: '700' },
});
