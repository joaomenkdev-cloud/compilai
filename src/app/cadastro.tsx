import { Link } from 'expo-router';
import { Text } from 'react-native';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Tela } from '@/components/Tela';
import { cores } from '@/constants/tema';

// PLACEHOLDER (Fase 2): o formulário real entra na Fase 3.
export default function Cadastro() {
  return (
    <Tela>
      <CabecalhoTela secao="Criar conta" titulo="Criar conta" />
      <Link href="/login" accessibilityRole="link" style={{ color: cores.primaria }}>
        <Text>Já tenho conta</Text>
      </Link>
    </Tela>
  );
}
