import { useLocalSearchParams } from 'expo-router';

import { ConteudoPerfil } from '@/components/ConteudoPerfil';

// Perfil público de outra pessoa, aberto pelo ID que vem na rota.
// Mostra só os dados públicos: sem controle de edição.
export default function PerfilPessoa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // key={id}: ao abrir outra pessoa, a tela recomeça do zero (sem mostrar dados da anterior).
  return <ConteudoPerfil key={id} pessoaId={id} ehProprio={false} />;
}
