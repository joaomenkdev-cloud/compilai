import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoErro } from '@/components/EstadoErro';
import { TelaEntrada } from '@/components/TelaEntrada';
import { areaToque, cores, espaco, familia, fonte, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { validarEmail } from '@/lib/validacao';

export default function Login() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEntrar() {
    const eEmail = validarEmail(email);
    const eSenha = senha.length === 0 ? 'Informe sua senha.' : null;
    setErroEmail(eEmail);
    setErroSenha(eSenha);
    setErroGeral(null);
    if (eEmail || eSenha) return;

    setEnviando(true);
    const { erro } = await entrar(email, senha);
    setEnviando(false);
    // Em caso de erro ficamos na tela, com o e-mail preservado. No sucesso, o
    // AuthProvider detecta a sessão e as rotas protegidas levam ao Início.
    if (erro) setErroGeral(erro);
  }

  return (
    <TelaEntrada frase="A rede de quem está aprendendo a programar. Compartilhe o que você está construindo.">
      <CabecalhoTela secao="Entrar" titulo="Bem-vindo de volta" />
      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        erro={erroEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        placeholder="voce@exemplo.com"
      />
      <CampoTexto
        rotulo="Senha"
        value={senha}
        onChangeText={setSenha}
        erro={erroSenha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        placeholder="Sua senha"
        onSubmitEditing={aoEntrar}
      />
      {erroGeral ? <EstadoErro mensagem={erroGeral} /> : null}
      <Botao titulo="Entrar" icone="log-in-outline" aoPressionar={aoEntrar} carregando={enviando} />
      <View style={estilos.rodape}>
        <Text style={estilos.textoRodape}>Ainda não tem conta?</Text>
        <Link href="/cadastro" accessibilityRole="link" accessibilityLabel="Criar conta" style={estilos.link}>
          Criar conta
        </Link>
      </View>
    </TelaEntrada>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  rodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espaco.sm, flexWrap: 'wrap' },
  textoRodape: { ...fonte.corpo, color: cores.textoSuave },
  link: {
    ...fonte.corpo,
    fontFamily: familia.negrito,
    color: cores.primaria,
    paddingVertical: espaco.md,
    minHeight: areaToque,
    textDecorationLine: 'underline',
  },
}));
