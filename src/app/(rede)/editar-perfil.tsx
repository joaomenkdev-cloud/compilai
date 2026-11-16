import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';

// PLACEHOLDER (Fase 2): o formulário real entra na Fase 6.
export default function EditarPerfil() {
  return (
    <Tela>
      <CabecalhoTela secao="Perfil" titulo="Editar perfil" />
      <EstadoVazio titulo="Nome e biografia" mensagem="Em construção." />
    </Tela>
  );
}
