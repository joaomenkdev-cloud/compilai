import { ConteudoPerfil } from '@/components/ConteudoPerfil';
import { useAuth } from '@/contexts/AuthProvider';

// Perfil próprio: mesmo conteúdo do perfil público, mas com o botão Editar perfil.
export default function Perfil() {
  const { usuario } = useAuth();
  if (!usuario) return null;
  return <ConteudoPerfil key={usuario.id} pessoaId={usuario.id} ehProprio />;
}
