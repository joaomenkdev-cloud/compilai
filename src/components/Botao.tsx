import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { areaToque, cores, espaco, fonte, pressionado, raio, sombra, estiloTema } from '@/constants/tema';

type Props = {
  titulo: string;
  aoPressionar: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  desativado?: boolean;
  carregando?: boolean;
  /** Ícone opcional à esquerda do texto. */
  icone?: keyof typeof Ionicons.glyphMap;
  /** Se omitido, o leitor de tela lê o próprio título. */
  rotuloAcessivel?: string;
};

// Botão padrão do app. Fica desativado (e avisa o leitor de tela)
// enquanto uma requisição está em andamento. Ao tocar, "afunda" levemente.
export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  desativado = false,
  carregando = false,
  icone,
  rotuloAcessivel,
}: Props) {
  const inativo = desativado || carregando;
  const corTexto =
    variante === 'primario' ? cores.sobrePrimaria : variante === 'perigo' ? cores.erro : cores.primaria;

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        estilos.base,
        variante === 'primario' && [estilos.primario, !inativo && sombra.botao],
        variante === 'secundario' && estilos.secundario,
        variante === 'perigo' && estilos.perigo,
        inativo && estilos.inativo,
        pressed && !inativo && pressionado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <View style={estilos.conteudo}>
          {icone ? <Ionicons name={icone} size={20} color={corTexto} /> : null}
          <Text style={[estilos.texto, { color: corTexto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  base: {
    minHeight: areaToque + 8,
    paddingHorizontal: espaco.xl,
    borderRadius: raio.campo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  primario: { backgroundColor: cores.primaria },
  secundario: { backgroundColor: cores.superficie, borderWidth: 1.5, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.superficie, borderWidth: 1.5, borderColor: cores.erro },
  inativo: { opacity: 0.45 },
  texto: { ...fonte.botao },
}));
