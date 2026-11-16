import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

// PLACEHOLDER (Fase 2): avisos reais entram na Fase 8.
export default function Notificacoes() {
  return (
    <Tela>
      <CabecalhoTela secao="Notificações" titulo="Avisos" />
      <EstadoVazio titulo="Novas e anteriores" mensagem="Em construção." />
    </Tela>
  );
}
