import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { areaToque, cores, espaco, estiloTema, familia, fonte, raio } from '@/constants/tema';

export type Acao = {
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  aoPressionar: () => void;
  /** Ação destrutiva (ex.: excluir): fica em vermelho. */
  perigo?: boolean;
};

type Props = {
  visivel: boolean;
  aoFechar: () => void;
  titulo?: string;
  /** Lista de ações (menu ⋯). */
  acoes?: Acao[];
  /** Ou conteúdo livre (ex.: confirmação, editor). */
  children?: ReactNode;
};

// "Folha" que sobe de baixo: menu de ações e confirmações.
// Usamos Modal (e não Alert) porque o Alert com vários botões não aparece na web.
// Tocar fora ou em "Cancelar" fecha sem fazer nada.
export function Folha({ visivel, aoFechar, titulo, acoes, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <Pressable style={estilos.fundo} onPress={aoFechar} accessibilityLabel="Fechar" accessibilityRole="button">
        {/* Pressable interno sem ação: toques dentro da folha não a fecham. */}
        <Pressable style={[estilos.folha, { paddingBottom: insets.bottom + espaco.lg }]} onPress={() => {}} accessible={false}>
          <View style={estilos.alca} />
          {titulo ? (
            <Text style={estilos.titulo} accessibilityRole="header">
              {titulo}
            </Text>
          ) : null}
          {acoes?.map((a) => (
            <Pressable
              key={a.rotulo}
              onPress={() => {
                aoFechar();
                a.aoPressionar();
              }}
              accessibilityRole="button"
              accessibilityLabel={a.rotulo}
              style={({ pressed }) => [estilos.acao, pressed && { backgroundColor: cores.superficieSuave }]}
            >
              <Ionicons name={a.icone} size={22} color={a.perigo ? cores.erro : cores.primaria} />
              <Text style={[estilos.textoAcao, a.perigo && { color: cores.erro }]}>{a.rotulo}</Text>
            </Pressable>
          ))}
          {children}
          {acoes ? (
            <Pressable
              onPress={aoFechar}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              style={({ pressed }) => [estilos.acao, estilos.cancelar, pressed && { opacity: 0.7 }]}
            >
              <Text style={[estilos.textoAcao, { color: cores.textoSuave }]}>Cancelar</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    fundo: { flex: 1, backgroundColor: cores.sobreposicao, justifyContent: 'flex-end', alignItems: 'center' },
    folha: {
      width: '100%',
      maxWidth: 560,
      backgroundColor: cores.superficie,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: espaco.lg,
      paddingTop: espaco.sm,
      gap: espaco.xs,
    },
    alca: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: cores.borda, marginBottom: espaco.sm },
    titulo: { ...fonte.subtitulo, color: cores.texto, marginBottom: espaco.sm, paddingHorizontal: espaco.xs },
    acao: {
      minHeight: areaToque + 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaco.md,
      paddingHorizontal: espaco.md,
      borderRadius: raio.campo,
    },
    cancelar: { justifyContent: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cores.borda, marginTop: espaco.xs },
    textoAcao: { fontFamily: familia.medio, fontSize: 16, color: cores.texto },
  }),
);
