import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Tela } from '@/components/Tela';
import { cores, espaco, fonte, raio } from '@/constants/tema';

const COMBINADOS = [
  {
    titulo: 'Mostre o processo, não só o resultado',
    texto: 'Vale postar a tela pela metade, o bug que travou e o que você aprendeu com ele.',
  },
  {
    titulo: 'Toda dúvida é bem-vinda',
    texto: 'Ninguém nasceu sabendo programar. Responda como gostaria de ser respondido.',
  },
  {
    titulo: 'Critique o código, nunca a pessoa',
    texto: 'Sugestão boa é específica e gentil: "e se você tentasse um FlatList aqui?".',
  },
  {
    titulo: 'Comemore a conquista dos colegas',
    texto: 'Primeiro app rodando, prova aprovada, estágio novo: uma curtida faz diferença.',
  },
  {
    titulo: 'Cuidado com dados pessoais',
    texto: 'Não publique senhas, chaves de API nem informações de outras pessoas.',
  },
];

export default function Sobre() {
  return (
    <Tela>
      <CabecalhoTela secao="Sobre" titulo="Sobre o projeto" />

      <View style={estilos.cartaoMarca}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={estilos.marca}
          accessibilityIgnoresInvertColors
          accessible={false}
        />
        <View style={{ flex: 1, gap: espaco.xs }}>
          <Text style={estilos.nome}>CompilaAí</Text>
          <Text style={estilos.texto}>Projetos, dúvidas e conquistas de quem está aprendendo a programar.</Text>
        </View>
      </View>

      <Secao titulo="Para quem é">
        <Text style={estilos.texto}>
          O CompilaAí é a rede dos alunos de Desenvolvimento de Sistemas. Aqui cada pessoa conta, em um
          post curto, o que está construindo ou aprendendo: um app novo, uma dúvida de lógica, uma prova
          vencida. Os colegas descobrem, curtem e comentam para ajudar.
        </Text>
      </Secao>

      <Secao titulo="Combinados da comunidade">
        {COMBINADOS.map((c, i) => (
          <View key={c.titulo} style={estilos.combinado}>
            <Text style={estilos.numero} accessibilityElementsHidden importantForAccessibility="no">
              {i + 1}
            </Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={estilos.tituloCombinado}>{c.titulo}</Text>
              <Text style={estilos.texto}>{c.texto}</Text>
            </View>
          </View>
        ))}
      </Secao>

      <Secao titulo="Seus dados">
        <Text style={estilos.texto}>
          Publicações, curtidas, comentários e perfis ficam na nuvem (Supabase), protegidos por regras de acesso:
          só você edita o seu perfil e só você lê os seus avisos. O rascunho e a última leitura do feed ficam
          apenas neste aparelho, separados por conta. Sua senha nunca é guardada no aparelho.
        </Text>
      </Secao>

      <Secao titulo="Créditos">
        <Linha rotulo="Autoria" valor="João Vitor Menk Alves" />
        <Linha rotulo="Disciplina" valor="Desenvolvimento de Aplicativos Mobile II (PAM II)" />
        <Linha rotulo="Professor" valor="Hugo Alessi Rolim Moreira da Silva" />
        <Linha rotulo="Escola" valor="ETEC Prof. Edson Galvão" />
        <Linha rotulo="Feito com" valor="React Native, Expo, Supabase e SQLite" />
      </Secao>
    </Tela>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.tituloSecao} accessibilityRole="header">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.linha} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={estilos.rotulo}>{rotulo.toUpperCase()}</Text>
      <Text style={estilos.texto}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartaoMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.lg,
    backgroundColor: cores.primaria,
    borderRadius: raio.card,
    padding: espaco.lg,
  },
  marca: { width: 64, height: 64 },
  nome: { fontSize: 24, fontWeight: '800', color: cores.sobrePrimaria },
  secao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.md,
  },
  tituloSecao: { ...fonte.subtitulo, color: cores.primaria },
  texto: { ...fonte.corpo, color: cores.texto },
  combinado: { flexDirection: 'row', gap: espaco.md },
  numero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.destaqueTexto,
    color: cores.sobrePrimaria,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '800',
    overflow: 'hidden',
  },
  tituloCombinado: { ...fonte.rotulo, fontSize: 15, color: cores.texto },
  linha: { gap: 2 },
  rotulo: { ...fonte.sobrancelha, color: cores.destaqueTexto },
});
