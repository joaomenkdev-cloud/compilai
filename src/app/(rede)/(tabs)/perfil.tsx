import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AbasInternas } from '@/components/AbasInternas';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

type AbaPerfil = 'posts' | 'sobre';

// PLACEHOLDER (Fase 2): dados reais do perfil entram na Fase 6.
export default function Perfil() {
  const router = useRouter();
  const [aba, setAba] = useState<AbaPerfil>('posts');

  return (
    <Tela>
      <CabecalhoTela secao="Perfil" titulo="Meu perfil" />
      <Botao titulo="Editar perfil" variante="secundario" aoPressionar={() => router.push('/editar-perfil')} />
      <AbasInternas
        abas={[
          { id: 'posts', rotulo: 'Posts' },
          { id: 'sobre', rotulo: 'Sobre' },
        ]}
        selecionada={aba}
        aoMudar={setAba}
      />
      <EstadoVazio
        titulo={aba === 'posts' ? 'Posts do titular' : 'Nome e biografia'}
        mensagem="Em construção."
      />
    </Tela>
  );
}
