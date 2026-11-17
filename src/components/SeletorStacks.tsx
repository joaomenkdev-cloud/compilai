import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { cores, espaco, estiloTema, familia, fonte, raio } from '@/constants/tema';
import { AREAS, GRUPOS_STACK, MAX_AREAS, MAX_STACKS, normalizar } from '@/constants/tecnologias';
import { alternarItem } from '@/lib/validacao';

// ───────────── Áreas de atuação (até 3) ─────────────
export function SeletorAreas({ valor, aoMudar }: { valor: string[]; aoMudar: (areas: string[]) => void }) {
  const cheio = valor.length >= MAX_AREAS;
  return (
    <View style={estilos.secao}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.rotulo}>No que você trabalha?</Text>
        <Text style={estilos.contador}>
          {valor.length}/{MAX_AREAS}
        </Text>
      </View>
      <Text style={estilos.ajuda}>Escolha até {MAX_AREAS} áreas.</Text>
      <View style={estilos.linha}>
        {AREAS.map((area) => {
          const marcado = valor.includes(area);
          return (
            <Chip
              key={area}
              rotulo={area}
              selecionado={marcado}
              desativado={cheio && !marcado}
              aoPressionar={() => aoMudar(alternarItem(valor, area, MAX_AREAS))}
            />
          );
        })}
      </View>
    </View>
  );
}

// ───────────── Stacks (até 15), com busca e grupos ─────────────
export function SeletorStacks({ valor, aoMudar }: { valor: string[]; aoMudar: (stacks: string[]) => void }) {
  const [busca, setBusca] = useState('');
  const termo = normalizar(busca);
  const cheio = valor.length >= MAX_STACKS;
  const alternar = (stack: string) => aoMudar(alternarItem(valor, stack, MAX_STACKS));

  // Com busca, mostra só os grupos que têm algo parecido com o termo.
  const grupos = GRUPOS_STACK.map((g) => ({
    ...g,
    itens: termo ? g.itens.filter((s) => normalizar(s).includes(termo)) : g.itens,
  })).filter((g) => g.itens.length > 0);

  return (
    <View style={estilos.secao}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.rotulo}>Suas stacks</Text>
        <Text style={[estilos.contador, cheio && { color: cores.destaqueTexto }]} accessibilityLabel={`${valor.length} de ${MAX_STACKS} stacks escolhidas`}>
          {valor.length}/{MAX_STACKS}
        </Text>
      </View>
      <Text style={estilos.ajuda}>Linguagens e tecnologias com que você trabalha ou estuda (até {MAX_STACKS}).</Text>

      {valor.length > 0 ? (
        <View style={estilos.escolhidas}>
          <Text style={estilos.subrotulo}>Escolhidas (toque para tirar)</Text>
          <View style={estilos.linha}>
            {valor.map((s) => (
              <Chip key={s} rotulo={s} selecionado removivel rotuloAcessivel={`Tirar ${s}`} aoPressionar={() => alternar(s)} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={estilos.campoBusca}>
        <Ionicons name="search" size={18} color={cores.textoSuave} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar: Python, React, Docker…"
          placeholderTextColor={cores.textoSuave}
          accessibilityLabel="Buscar stack"
          autoCapitalize="none"
          autoCorrect={false}
          style={estilos.entrada}
        />
      </View>
      {cheio ? <Text style={estilos.aviso}>Você chegou ao limite de {MAX_STACKS}. Tire uma para escolher outra.</Text> : null}

      {grupos.length === 0 ? (
        <Text style={estilos.ajuda}>Nenhuma stack encontrada para “{busca}”.</Text>
      ) : (
        grupos.map((g) => (
          <View key={g.grupo} style={estilos.grupo}>
            <Text style={estilos.subrotulo} accessibilityRole="header">
              {g.grupo}
            </Text>
            <View style={estilos.linha}>
              {g.itens.map((s) => {
                const marcado = valor.includes(s);
                return (
                  <Chip key={s} rotulo={s} selecionado={marcado} desativado={cheio && !marcado} aoPressionar={() => alternar(s)} />
                );
              })}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    secao: { gap: espaco.sm },
    cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rotulo: { ...fonte.rotulo, fontSize: 15, color: cores.texto },
    subrotulo: { fontFamily: familia.negrito, fontSize: 12, letterSpacing: 0.5, color: cores.textoSuave },
    contador: { fontFamily: familia.negrito, fontSize: 13, color: cores.textoSuave },
    ajuda: { ...fonte.pequena, color: cores.textoSuave },
    aviso: { ...fonte.pequena, color: cores.destaqueTexto },
    linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
    escolhidas: {
      gap: espaco.sm,
      padding: espaco.md,
      borderRadius: raio.campo,
      backgroundColor: cores.primariaClara,
    },
    campoBusca: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaco.sm,
      paddingHorizontal: espaco.md,
      borderRadius: raio.campo,
      borderWidth: 1.5,
      borderColor: cores.borda,
      backgroundColor: cores.superficie,
    },
    entrada: { flex: 1, minHeight: 44, fontFamily: familia.regular, fontSize: 15, color: cores.texto },
    grupo: { gap: espaco.sm, marginTop: espaco.xs },
  }),
);
