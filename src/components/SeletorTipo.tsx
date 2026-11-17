import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { infoTipo } from '@/components/EtiquetaTipo';
import { areaToque, cores, espaco, estiloTema, familia, fonte, raio } from '@/constants/tema';
import { TIPOS_POST, type TipoPost } from '@/services/postService';

type Props<T extends TipoPost | null> = {
  valor: T;
  aoMudar: (tipo: T) => void;
  /** Mostra também a opção "Todos" (null) — usado no filtro do Explorar. */
  comTodos?: boolean;
  rotulo?: string;
};

// Escolha do tipo da publicação em "pílulas" (um só selecionado, como botões de rádio).
export function SeletorTipo<T extends TipoPost | null>({ valor, aoMudar, comTodos = false, rotulo }: Props<T>) {
  const opcoes: { id: TipoPost | null; rotulo: string }[] = comTodos
    ? [{ id: null, rotulo: 'Todos' }, ...TIPOS_POST]
    : TIPOS_POST;

  return (
    <View style={estilos.caixa}>
      {rotulo ? <Text style={estilos.rotulo}>{rotulo}</Text> : null}
      <View style={estilos.linha} accessibilityRole="radiogroup">
        {opcoes.map((o) => {
          const ativo = o.id === valor;
          const info = o.id ? infoTipo(o.id) : null;
          return (
            <Pressable
              key={o.rotulo}
              onPress={() => aoMudar(o.id as T)}
              accessibilityRole="radio"
              accessibilityLabel={o.rotulo}
              accessibilityState={{ checked: ativo }}
              aria-checked={ativo}
              style={({ pressed }) => [
                estilos.pilula,
                ativo && { backgroundColor: info?.fundo ?? cores.primariaClara, borderColor: info?.cor ?? cores.primaria },
                pressed && { opacity: 0.8 },
              ]}
            >
              {info ? <Ionicons name={info.icone} size={16} color={ativo ? info.cor : cores.textoSuave} /> : null}
              <Text style={[estilos.texto, ativo && { color: info?.cor ?? cores.primaria, fontFamily: familia.negrito }]}>
                {o.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    caixa: { gap: 6 },
    rotulo: { ...fonte.rotulo, color: cores.texto },
    linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
    pilula: {
      minHeight: areaToque,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: espaco.md,
      borderRadius: raio.pilula,
      borderWidth: 1.5,
      borderColor: cores.borda,
      backgroundColor: cores.superficie,
    },
    texto: { fontFamily: familia.medio, fontSize: 14, color: cores.textoSuave },
  }),
);
