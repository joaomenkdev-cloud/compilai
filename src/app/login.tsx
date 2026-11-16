import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CampoTexto } from '@/components/CampoTexto';
import { Tela } from '@/components/Tela';
import { areaToque, cores, espaco, fonte } from '@/constants/tema';
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
    <Tela>
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
      />
      {erroGeral ? (
        <View style={estilos.caixaErro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={estilos.textoErro}>{erroGeral}</Text>
        </View>
      ) : null}
      <Botao titulo="Entrar" aoPressionar={aoEntrar} carregando={enviando} />
      <View style={estilos.rodape}>
        <Text style={estilos.textoRodape}>Ainda não tem conta?</Text>
        <Link href="/cadastro" accessibilityRole="link" accessibilityLabel="Criar conta" style={estilos.link}>
          Criar conta
        </Link>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  caixaErro: {
    borderWidth: 1.5,
    borderColor: cores.erro,
    borderRadius: 12,
    padding: espaco.md,
    backgroundColor: '#FDECEA',
  },
  textoErro: { ...fonte.corpo, color: cores.erro },
  rodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espaco.sm, flexWrap: 'wrap' },
  textoRodape: { ...fonte.corpo, color: cores.textoSuave },
  link: { ...fonte.corpo, fontWeight: '700', color: cores.primaria, paddingVertical: espaco.md, minHeight: areaToque },
});
