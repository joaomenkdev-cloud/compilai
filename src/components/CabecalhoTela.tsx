import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, estiloTema } from '@/constants/tema';

type Props = {
  /** Seção da tela, ex.: "INÍCIO". Aparece como "COMPILAAÍ / INÍCIO". */
  secao: string;
  titulo: string;
  /** Linha de apoio opcional abaixo do título. */
  subtitulo?: string;
};

// Cabeçalho padrão das telas: "sobrancelha" pequena + título grande.
export function CabecalhoTela({ secao, titulo, subtitulo }: Props) {
  return (
    <View style={estilos.caixa}>
      <View style={estilos.linhaSobrancelha}>
        <View style={estilos.ponto} />
        <Text style={estilos.sobrancelha}>{`COMPILAAÍ / ${secao.toUpperCase()}`}</Text>
      </View>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  caixa: { gap: espaco.xs },
  linhaSobrancelha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ponto: { width: 8, height: 8, borderRadius: 2, backgroundColor: cores.destaque },
  sobrancelha: { ...fonte.sobrancelha, color: cores.destaqueTexto },
  titulo: { ...fonte.titulo, color: cores.primaria },
  subtitulo: { ...fonte.corpo, color: cores.textoSuave },
}));
