import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoErro } from '@/components/EstadoErro';
import { Tela } from '@/components/Tela';
import { cores, espaco, fonte, raio, familia, estiloTema } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { mensagemDeErro } from '@/lib/erros';
import { atualizarPerfil, BIO_MAXIMA, NOME_MAXIMO } from '@/services/profileService';

export default function EditarPerfil() {
  const { usuario, perfil, atualizarPerfil: avisarContexto } = useAuth();
  const [nome, setNome] = useState(perfil?.nome ?? '');
  const [bio, setBio] = useState(perfil?.bio ?? '');
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroBio, setErroBio] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Guarda o perfil mais recente num ref: assim o efeito abaixo roda SÓ quando a tela
  // ganha foco, e não de novo quando salvar atualiza o perfil (o que apagaria
  // a mensagem "Perfil atualizado" logo depois de aparecer).
  const perfilAtual = useRef(perfil);
  useEffect(() => {
    perfilAtual.current = perfil;
  }, [perfil]);

  // Ao abrir a tela, parte sempre dos dados salvos e sem mensagens antigas.
  useFocusEffect(
    useCallback(() => {
      setNome(perfilAtual.current?.nome ?? '');
      setBio(perfilAtual.current?.bio ?? '');
      setErroNome(null);
      setErroBio(null);
      setErroGeral(null);
      setSucesso(false);
    }, []),
  );

  async function aoSalvar() {
    if (!usuario) return;
    const eNome = !nome.trim()
      ? 'Informe seu nome.'
      : nome.trim().length > NOME_MAXIMO
        ? `Use até ${NOME_MAXIMO} caracteres.`
        : null;
    const eBio = bio.trim().length > BIO_MAXIMA ? `Use até ${BIO_MAXIMA} caracteres.` : null;
    setErroNome(eNome);
    setErroBio(eBio);
    setErroGeral(null);
    setSucesso(false);
    if (eNome || eBio) return;

    setSalvando(true);
    try {
      // Grava com o ID da SESSÃO (nunca um ID vindo da tela).
      const salvo = await atualizarPerfil(usuario.id, nome, bio);
      avisarContexto(salvo);
      setSucesso(true); // só confirma depois do sucesso do Supabase
    } catch (e) {
      setErroGeral(mensagemDeErro(e)); // o que foi digitado continua nos campos
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tela>
      <CabecalhoTela secao="Perfil" titulo="Editar perfil" />
      <CampoTexto
        rotulo="Nome de exibição"
        value={nome}
        onChangeText={(t) => {
          setNome(t);
          setSucesso(false);
        }}
        erro={erroNome}
        autoCapitalize="words"
        maxLength={NOME_MAXIMO + 10}
      />
      <CampoTexto
        rotulo="Biografia"
        value={bio}
        onChangeText={(t) => {
          setBio(t);
          setSucesso(false);
        }}
        erro={erroBio}
        multiline
        textAlignVertical="top"
        style={estilos.campoBio}
        placeholder="Ex.: 2º ano de DS, curto React Native e jogos."
      />
      <Text style={estilos.contador} accessibilityLabel={`${bio.trim().length} de ${BIO_MAXIMA} caracteres`}>
        {bio.trim().length}/{BIO_MAXIMA}
      </Text>
      {sucesso ? (
        <View style={estilos.sucesso} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={estilos.textoSucesso}>Perfil atualizado.</Text>
        </View>
      ) : null}
      {erroGeral ? <EstadoErro mensagem={`Não salvamos as alterações. ${erroGeral}`} aoTentarDeNovo={aoSalvar} /> : null}
      <Botao titulo="Salvar" aoPressionar={aoSalvar} carregando={salvando} />
    </Tela>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  campoBio: { minHeight: 120, paddingTop: espaco.md },
  contador: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'right', marginTop: -espaco.sm },
  sucesso: {
    borderWidth: 1.5,
    borderColor: cores.sucesso,
    borderRadius: raio.campo,
    padding: espaco.md,
    backgroundColor: cores.sucessoClaro,
  },
  textoSucesso: { ...fonte.corpo, fontFamily: familia.negrito, color: cores.sucesso },
}));
