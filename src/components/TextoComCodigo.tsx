import { Platform, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';

import { espaco, estiloTema, familia, raio } from '@/constants/tema';
import { separarCodigo } from '@/lib/codigo';

// Fonte de programação (monoespaçada) disponível em cada plataforma, sem instalar nada.
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, Consolas, monospace' });

type Props = {
  texto: string;
  /** Estilo do texto comum (o código usa fonte própria). */
  estiloTexto: TextStyle | TextStyle[];
  /** Limite de linhas do texto comum (no feed). No detalhe, sem limite. */
  linhas?: number;
  selecionavel?: boolean;
};

// Mostra o texto do post; o que estiver entre ``` aparece como bloco de código,
// com fundo escuro, fonte de programação e rolagem lateral (linhas longas não quebram).
export function TextoComCodigo({ texto, estiloTexto, linhas, selecionavel = false }: Props) {
  const pedacos = separarCodigo(texto);

  // Sem código: um Text simples (mais leve, e o numberOfLines funciona como antes).
  if (!pedacos.some((p) => p.tipo === 'codigo')) {
    return (
      <Text style={estiloTexto} numberOfLines={linhas} selectable={selecionavel}>
        {texto}
      </Text>
    );
  }

  return (
    <View style={estilos.caixa}>
      {pedacos.map((p, i) =>
        p.tipo === 'texto' ? (
          <Text key={i} style={estiloTexto} selectable={selecionavel}>
            {p.conteudo}
          </Text>
        ) : (
          <View
            key={i}
            style={estilos.bloco}
            accessible
            accessibilityLabel={`Código${p.linguagem ? ` em ${p.linguagem}` : ''}: ${p.conteudo}`}
          >
            {p.linguagem ? <Text style={estilos.linguagem}>{p.linguagem.toUpperCase()}</Text> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={estilos.codigo} selectable>
                {p.conteudo}
              </Text>
            </ScrollView>
          </View>
        ),
      )}
    </View>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    caixa: { gap: espaco.sm },
    // Fundo escuro fixo nos dois temas (como um editor de código).
    bloco: {
      backgroundColor: '#0E1A1E',
      borderRadius: raio.campo,
      padding: espaco.md,
      gap: 6,
      borderLeftWidth: 3,
      borderLeftColor: '#E36414',
    },
    linguagem: { fontFamily: familia.negrito, fontSize: 10, letterSpacing: 1, color: '#8FB3BD' },
    codigo: { fontFamily: MONO, fontSize: 13, lineHeight: 20, color: '#E6F1F3' },
  }),
);
