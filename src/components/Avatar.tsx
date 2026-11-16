import { StyleSheet, Text, View } from 'react-native';

import { cores } from '@/constants/tema';

/** "Bia Souza" → "BS"; "caio" → "C" */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

// Avatar com as iniciais do nome (sem foto, para manter o app simples).
// É decorativo: o nome já aparece em texto ao lado, então o leitor de tela o ignora.
export function Avatar({ nome, tamanho = 44 }: { nome: string; tamanho?: number }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[estilos.circulo, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}
    >
      <Text style={[estilos.texto, { fontSize: tamanho * 0.38 }]}>{iniciais(nome)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: { backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  texto: { color: cores.sobrePrimaria, fontWeight: '800' },
});
