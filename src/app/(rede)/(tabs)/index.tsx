import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AbasInternas } from '@/components/AbasInternas';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

type AbaInicio = 'recentes' | 'minhas';

// PLACEHOLDER (Fase 2): o feed real entra na Fase 5.
export default function Inicio() {
  const router = useRouter();
  const [aba, setAba] = useState<AbaInicio>('recentes');

  return (
    <Tela>
      <CabecalhoTela secao="Início" titulo="Comunidade" />
      <AbasInternas
        abas={[
          { id: 'recentes', rotulo: 'Recentes' },
          { id: 'minhas', rotulo: 'Minhas' },
        ]}
        selecionada={aba}
        aoMudar={setAba}
      />
      <EstadoVazio
        titulo={aba === 'recentes' ? 'Feed de todos' : 'Só os meus posts'}
        mensagem="Em construção."
      />
      {/* Atalho provisório para testar a navegação até o detalhe e o botão Voltar. */}
      <Botao titulo="Abrir publicação de teste" variante="secundario" aoPressionar={() => router.push('/post/teste')} />
      <Botao titulo="Abrir pessoa de teste" variante="secundario" aoPressionar={() => router.push('/pessoa/teste')} />
    </Tela>
  );
}
