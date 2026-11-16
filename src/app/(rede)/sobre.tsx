import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

// PLACEHOLDER (Fase 2): o texto final da tela Sobre entra na Fase 10.
export default function Sobre() {
  return (
    <Tela>
      <CabecalhoTela secao="Sobre" titulo="Sobre o projeto" />
      <EstadoVazio titulo="CompilaAí" mensagem="Em construção." />
    </Tela>
  );
}
