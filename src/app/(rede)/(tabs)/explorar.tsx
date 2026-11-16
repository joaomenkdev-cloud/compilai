import { useState } from 'react';

import { AbasInternas } from '@/components/AbasInternas';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

type AbaExplorar = 'pessoas' | 'posts';

// PLACEHOLDER (Fase 2): a busca real entra na Fase 6.
export default function Explorar() {
  const [aba, setAba] = useState<AbaExplorar>('pessoas');

  return (
    <Tela>
      <CabecalhoTela secao="Explorar" titulo="Descobrir" />
      <AbasInternas
        abas={[
          { id: 'pessoas', rotulo: 'Pessoas' },
          { id: 'posts', rotulo: 'Posts' },
        ]}
        selecionada={aba}
        aoMudar={setAba}
      />
      <EstadoVazio
        titulo={aba === 'pessoas' ? 'Buscar por nome' : 'Buscar por texto'}
        mensagem="Em construção."
      />
    </Tela>
  );
}
