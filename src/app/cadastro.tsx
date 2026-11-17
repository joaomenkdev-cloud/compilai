import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoErro } from '@/components/EstadoErro';
import { TelaEntrada } from '@/components/TelaEntrada';
import { areaToque, cores, espaco, familia, fonte, raio, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { validarConfirmacao, validarEmail, validarNome, validarSenha } from '@/lib/validacao';

type Erros = { nome?: string | null; email?: string | null; senha?: string | null; confirmacao?: string | null };

export default function Cadastro() {
  const router = useRouter();
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  async function aoCriarConta() {
    // 1) Valida tudo antes de enviar; cada mensagem aparece junto ao seu campo.
    const novos: Erros = {
      nome: validarNome(nome),
      email: validarEmail(email),
      senha: validarSenha(senha),
      confirmacao: validarConfirmacao(senha, confirmacao),
    };
    setErros(novos);
    setErroGeral(null);
    if (Object.values(novos).some(Boolean)) return;

    // 2) Envia. Sem erro e com sessão: o AuthProvider leva ao Início sozinho.
    setEnviando(true);
    const resultado = await cadastrar(nome, email, senha);
    setEnviando(false);

    if (resultado.erro) setErroGeral(resultado.erro);
    else if (resultado.precisaConfirmarEmail) setAguardandoConfirmacao(true);
  }

  // Projeto com "Confirm email" ligado: não há sessão até a pessoa clicar no link.
  if (aguardandoConfirmacao) {
    return (
      <TelaEntrada frase="Quase lá! Falta só confirmar o seu e-mail.">
        <CabecalhoTela secao="Criar conta" titulo="Confirme seu e-mail" />
        <View style={estilos.aviso} accessibilityRole="alert">
          <Text style={estilos.textoAviso}>
            {`Enviamos uma mensagem para ${email.trim()}. Abra o link que ela contém para ativar sua conta e depois volte aqui para entrar.`}
          </Text>
        </View>
        <Botao titulo="Ir para Entrar" icone="log-in-outline" aoPressionar={() => router.replace('/login')} />
      </TelaEntrada>
    );
  }

  return (
    <TelaEntrada frase="Crie sua conta e mostre para a turma o que você está construindo.">
      <CabecalhoTela secao="Criar conta" titulo="Entre para a comunidade" />
      <CampoTexto
        rotulo="Nome de exibição"
        value={nome}
        onChangeText={setNome}
        erro={erros.nome}
        autoCapitalize="words"
        autoComplete="name"
        placeholder="Como quer ser chamado(a)"
      />
      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        erro={erros.email}
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
        erro={erros.senha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        placeholder="Mínimo de 6 caracteres"
      />
      <CampoTexto
        rotulo="Confirmar senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        erro={erros.confirmacao}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        placeholder="Repita a senha"
      />
      {erroGeral ? <EstadoErro mensagem={erroGeral} /> : null}
      <Botao titulo="Criar conta" icone="person-add-outline" aoPressionar={aoCriarConta} carregando={enviando} />
      <View style={estilos.rodape}>
        <Text style={estilos.textoRodape}>Já tem conta?</Text>
        <Link href="/login" accessibilityRole="link" accessibilityLabel="Entrar" style={estilos.link}>
          Entrar
        </Link>
      </View>
    </TelaEntrada>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  aviso: {
    borderLeftWidth: 4,
    borderLeftColor: cores.primaria,
    borderRadius: raio.campo,
    padding: espaco.lg,
    backgroundColor: cores.primariaClara,
  },
  textoAviso: { ...fonte.corpo, color: cores.texto },
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
