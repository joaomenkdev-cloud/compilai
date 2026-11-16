import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { EstadoVazio } from '@/components/EstadoVazio';
import { cores, espaco } from '@/constants/tema';

// Rota inexistente (ex.: link digitado errado). Em vez da tela padrão em inglês,
// mostramos uma mensagem em português e um caminho de volta.
export default function NaoEncontrada() {
  const router = useRouter();
  return (
    <View style={estilos.fundo}>
      <EstadoVazio
        icone="compass-outline"
        titulo="Página não encontrada"
        mensagem="Esse endereço não existe no CompilaAí."
      />
      <Botao titulo="Ir para o início" icone="home-outline" aoPressionar={() => router.replace('/')} />
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo, padding: espaco.xl, justifyContent: 'center', gap: espaco.lg },
});
