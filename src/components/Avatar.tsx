import { StyleSheet, Text, View } from 'react-native';

import { familia } from '@/constants/tema';

/** "Bia Souza" → "BS"; "caio" → "C" */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

// Cores de fundo do avatar: todas com texto branco legível (contraste ≥ 4,5:1).
const FUNDOS = ['#0F4C5C', '#A8420A', '#5B3F8C', '#1E6B4A', '#8A2C4F', '#2F5A8C'];

/** Mesma pessoa = mesma cor, sempre (a cor sai do nome). */
function corDoNome(nome: string): string {
  let soma = 0;
  for (const letra of nome) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  return FUNDOS[soma % FUNDOS.length];
}

// Avatar com as iniciais do nome (sem foto, para manter o app simples).
// É decorativo: o nome já aparece em texto ao lado, então o leitor de tela o ignora.
export function Avatar({ nome, tamanho = 44 }: { nome: string; tamanho?: number }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        estilos.circulo,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: corDoNome(nome) },
      ]}
    >
      <Text style={[estilos.texto, { fontSize: tamanho * 0.38 }]}>{iniciais(nome)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: { alignItems: 'center', justifyContent: 'center' },
  texto: { color: '#FFFFFF', fontFamily: familia.titulo },
});
