import { useLocalSearchParams } from 'expo-router';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

// PLACEHOLDER (Fase 2): perfil público real entra na Fase 6.
export default function PerfilPessoa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Tela>
      <CabecalhoTela secao="Pessoa" titulo="Perfil" />
      <EstadoVazio titulo={`Pessoa ${id}`} mensagem="Em construção." />
    </Tela>
  );
}
