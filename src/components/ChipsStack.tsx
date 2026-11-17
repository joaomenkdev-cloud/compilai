import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { cores, espaco, estiloTema, familia } from '@/constants/tema';

type Props = {
  stacks: string[];
  /** Quantas mostrar antes do "+N" (sem limite = todas). */
  limite?: number;
};

// Stacks de um perfil. Tocar numa stack abre o Explorar com "Quem também usa <stack>".
export function ChipsStack({ stacks, limite }: Props) {
  const router = useRouter();
  if (stacks.length === 0) return null;
  const visiveis = limite ? stacks.slice(0, limite) : stacks;
  const resto = stacks.length - visiveis.length;

  return (
    <View style={estilos.linha}>
      {visiveis.map((s) => (
        <Chip
          key={s}
          rotulo={s}
          rotuloAcessivel={`${s}. Ver quem também usa`}
          aoPressionar={() => router.navigate({ pathname: '/explorar', params: { stack: s } })}
        />
      ))}
      {resto > 0 ? <Text style={estilos.mais}>+{resto}</Text> : null}
    </View>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, alignItems: 'center' },
    mais: { fontFamily: familia.negrito, fontSize: 13, color: cores.textoSuave, paddingHorizontal: espaco.xs },
  }),
);
