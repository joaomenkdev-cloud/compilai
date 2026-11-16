import { useState } from 'react';

import { AbasInternas } from '@/components/AbasInternas';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

type AbaPublicar = 'escrever' | 'rascunho';

// PLACEHOLDER (Fase 2): escrever, publicar e rascunho entram nas Fases 5 e 9.
export default function Publicar() {
  const [aba, setAba] = useState<AbaPublicar>('escrever');

  return (
    <Tela>
      <CabecalhoTela secao="Publicar" titulo="Nova publicação" />
      <AbasInternas
        abas={[
          { id: 'escrever', rotulo: 'Escrever' },
          { id: 'rascunho', rotulo: 'Rascunho' },
        ]}
        selecionada={aba}
        aoMudar={setAba}
      />
      <EstadoVazio
        titulo={aba === 'escrever' ? 'Compor e enviar' : 'Recuperar e editar'}
        mensagem="Em construção."
      />
    </Tela>
  );
}
