import { useLocalSearchParams } from 'expo-router';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

// PLACEHOLDER (Fase 2): detalhe, curtidas e comentários entram na Fase 7.
// O ID vem pela rota: é ele que identifica exatamente o post aberto.
export default function DetalhePost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Tela>
      <CabecalhoTela secao="Publicação" titulo="Publicação" />
      <EstadoVazio titulo={`Post ${id}`} mensagem="Em construção." />
    </Tela>
  );
}
