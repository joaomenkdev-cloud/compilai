import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ListaDestaques } from '@/components/ListaDestaques';
import { cores, espaco, familia, fonte, raio, sombra, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useAvisos } from '@/contexts/AvisosProvider';
import { listarPessoas, type Perfil } from '@/services/profileService';

// Coluna da direita do feed (só em telas largas): avisos e pessoas da comunidade.
export function ColunaComunidade() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { naoLidos } = useAvisos();
  const [pessoas, setPessoas] = useState<Perfil[] | null>(null);
  const usuarioId = usuario?.id;

  useFocusEffect(
    useCallback(() => {
      if (!usuarioId) return;
      listarPessoas(usuarioId)
        .then(setPessoas)
        .catch(() => setPessoas([]));
    }, [usuarioId]),
  );

  return (
    <ScrollView style={estilos.coluna} contentContainerStyle={estilos.conteudo}>
      {/* Avisos */}
      <View style={[estilos.cartao, sombra.card]}>
        <View style={estilos.titulo}>
          <Text style={estilos.rotulo}>AVISOS</Text>
          {naoLidos > 0 ? (
            <View style={estilos.bolinha}>
              <Text style={estilos.numeroBolinha}>{naoLidos}</Text>
            </View>
          ) : null}
        </View>
        <Text style={estilos.texto}>
          {naoLidos === 0
            ? 'Você está em dia: nenhum aviso novo.'
            : naoLidos === 1
              ? 'Você tem 1 aviso novo de curtida ou comentário.'
              : `Você tem ${naoLidos} avisos novos de curtidas e comentários.`}
        </Text>
        <Pressable
          onPress={() => router.navigate('/notificacoes')}
          accessibilityRole="button"
          accessibilityLabel="Ver notificações"
          style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.85 }]}
        >
          <Text style={estilos.textoBotao}>Ver notificações</Text>
        </Pressable>
      </View>

      <ListaDestaques compacta />

      {/* Pessoas */}
      <View style={[estilos.cartao, sombra.card]}>
        <Text style={estilos.rotulo}>PESSOAS DA COMUNIDADE</Text>
        {pessoas === null ? (
          <Text style={estilos.texto}>Carregando…</Text>
        ) : pessoas.length === 0 ? (
          <Text style={estilos.texto}>Ninguém por aqui ainda.</Text>
        ) : (
          pessoas.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push({ pathname: '/pessoa/[id]', params: { id: p.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir perfil de ${p.nome}`}
              style={({ pressed }) => [estilos.pessoa, pressed && { backgroundColor: cores.superficieSuave }]}
            >
              <Avatar nome={p.nome} tamanho={36} />
              <View style={{ flex: 1 }}>
                <Text style={estilos.nome} numberOfLines={1}>
                  {p.nome}
                </Text>
                {p.bio ? (
                  <Text style={estilos.bio} numberOfLines={1}>
                    {p.bio}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
            </Pressable>
          ))
        )}
        <Pressable
          onPress={() => router.navigate('/explorar')}
          accessibilityRole="link"
          accessibilityLabel="Buscar mais pessoas"
          style={estilos.link}
        >
          <Text style={estilos.textoLink}>Buscar mais pessoas</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  coluna: { width: 320, flexGrow: 0, flexShrink: 0 },
  conteudo: { paddingVertical: espaco.lg, paddingRight: espaco.lg, gap: espaco.lg },
  cartao: { backgroundColor: cores.superficie, borderRadius: raio.card, padding: espaco.lg, gap: espaco.md },
  titulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rotulo: { ...fonte.sobrancelha, color: cores.textoSuave },
  bolinha: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    backgroundColor: cores.destaqueTexto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroBolinha: { fontFamily: familia.negrito, fontSize: 12, color: cores.sobrePrimaria },
  texto: { ...fonte.corpo, fontSize: 14, lineHeight: 20, color: cores.texto },
  botao: {
    minHeight: 44,
    borderRadius: raio.campo,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotao: { fontFamily: familia.negrito, fontSize: 14, color: cores.sobrePrimaria },
  pessoa: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.xs,
    borderRadius: raio.campo,
  },
  nome: { fontFamily: familia.negrito, fontSize: 14, color: cores.texto },
  bio: { ...fonte.pequena, fontSize: 12, color: cores.textoSuave },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  textoLink: { fontFamily: familia.negrito, fontSize: 14, color: cores.primaria, textDecorationLine: 'underline' },
}));
