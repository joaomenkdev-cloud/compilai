import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AbasInternas } from '@/components/AbasInternas';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';
import { cores, espaco, fonte, raio } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { horaCurta } from '@/lib/datas';
import { ehErroDeRede, mensagemDeErro } from '@/lib/erros';
import { publicar, TEXTO_MAXIMO } from '@/services/postService';
import { apagarRascunho, lerRascunho, salvarRascunho } from '@/storage/draftStore';

type AbaPublicar = 'escrever' | 'rascunho';

export default function Publicar() {
  const router = useRouter();
  const { usuario } = useAuth();
  const dono = usuario?.id;

  const [aba, setAba] = useState<AbaPublicar>('escrever');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  /** Rascunho guardado no SQLite para esta conta (undefined = ainda lendo). */
  const [rascunho, setRascunho] = useState<string | null | undefined>(undefined);

  // Regra do PDF: de 1 a 500 caracteres depois do trim().
  const tamanho = texto.trim().length;
  const valido = tamanho >= 1 && tamanho <= TEXTO_MAXIMO;
  const passou = tamanho > TEXTO_MAXIMO;

  // Lê o rascunho desta conta sempre que a tela aparece.
  useFocusEffect(
    useCallback(() => {
      if (!dono) return;
      lerRascunho(dono)
        .then(setRascunho)
        .catch(() => setRascunho(null));
    }, [dono]),
  );

  async function aoSalvarRascunho() {
    if (!dono || tamanho === 0) return;
    try {
      await salvarRascunho(dono, texto);
      setRascunho(texto);
      setErro(null);
      setAviso(`Rascunho salvo neste aparelho às ${horaCurta(new Date().toISOString())}.`);
    } catch {
      setAviso(null);
      setErro('Não foi possível salvar o rascunho no aparelho.');
    }
  }

  async function aoPublicar() {
    if (!dono || !valido || enviando) return;
    setEnviando(true);
    setErro(null);
    setAviso(null);
    try {
      await publicar(dono, texto);
      // Sucesso confirmado pelo banco: apaga SÓ o rascunho desta conta, limpa e vai ao Início.
      await apagarRascunho(dono).catch(() => {});
      setRascunho(null);
      setTexto('');
      router.navigate('/');
    } catch (e) {
      // Falha: o texto continua no campo para tentar de novo.
      if (ehErroDeRede(e)) {
        // Sem fila automática: guardamos como rascunho para o envio manual depois.
        await salvarRascunho(dono, texto).catch(() => {});
        setRascunho(texto);
        setErro('Sem conexão. Guardamos o texto como rascunho neste aparelho: publique quando a internet voltar.');
      } else {
        setErro(`A publicação não foi enviada. ${mensagemDeErro(e)}`);
      }
    } finally {
      setEnviando(false);
    }
  }

  async function aoDescartar() {
    if (!dono) return;
    await apagarRascunho(dono).catch(() => {});
    setRascunho(null);
  }

  function continuarEditando() {
    if (rascunho == null) return;
    setTexto(rascunho);
    setAviso(null);
    setErro(null);
    setAba('escrever');
  }

  return (
    <Tela>
      <CabecalhoTela secao="Publicar" titulo="Nova publicação" />
      <AbasInternas
        abas={[
          { id: 'escrever', rotulo: 'Escrever' },
          { id: 'rascunho', rotulo: 'Rascunho' },
        ]}
        selecionada={aba}
        aoMudar={setAba}
      />

      {aba === 'escrever' ? (
        <>
          <CampoTexto
            rotulo="O que você está construindo ou aprendendo?"
            value={texto}
            onChangeText={(t) => {
              setTexto(t);
              setAviso(null);
            }}
            multiline
            placeholder="Ex.: Terminei a tela de login do meu app em React Native!"
            style={estilos.campoGrande}
            textAlignVertical="top"
            erro={passou ? `Passou do limite de ${TEXTO_MAXIMO} caracteres.` : null}
          />
          <Text
            style={[estilos.contador, passou && estilos.contadorErro]}
            accessibilityLabel={`${tamanho} de ${TEXTO_MAXIMO} caracteres`}
          >
            {tamanho}/{TEXTO_MAXIMO}
          </Text>
          {aviso ? (
            <View style={estilos.sucesso} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Text style={estilos.textoSucesso}>{aviso}</Text>
            </View>
          ) : null}
          {erro ? <EstadoErro mensagem={erro} aoTentarDeNovo={aoPublicar} /> : null}
          <Botao titulo="Publicar" aoPressionar={aoPublicar} desativado={!valido} carregando={enviando} />
          <Botao
            titulo="Salvar rascunho"
            variante="secundario"
            aoPressionar={aoSalvarRascunho}
            desativado={tamanho === 0 || enviando}
          />
          <Text style={estilos.dica}>O rascunho fica só neste aparelho e só para a sua conta.</Text>
        </>
      ) : rascunho === undefined ? null : rascunho === null ? (
        <EstadoVazio titulo="Nenhum rascunho salvo" mensagem="Na aba Escrever, toque em Salvar rascunho para guardar o texto aqui." />
      ) : (
        <>
          <View style={estilos.cartaoRascunho}>
            <Text style={estilos.rotulo}>SEU RASCUNHO</Text>
            <Text style={estilos.textoRascunho}>{rascunho}</Text>
          </View>
          <Botao titulo="Continuar editando" aoPressionar={continuarEditando} />
          <Botao titulo="Descartar rascunho" variante="secundario" aoPressionar={aoDescartar} />
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  campoGrande: { minHeight: 160, paddingTop: espaco.md },
  contador: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'right', marginTop: -espaco.sm },
  contadorErro: { color: cores.erro, fontWeight: '700' },
  dica: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'center' },
  sucesso: {
    borderWidth: 1.5,
    borderColor: cores.sucesso,
    borderRadius: raio.campo,
    padding: espaco.md,
    backgroundColor: '#E8F5EE',
  },
  textoSucesso: { ...fonte.corpo, fontWeight: '700', color: cores.sucesso },
  cartaoRascunho: {
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.sm,
  },
  rotulo: { ...fonte.sobrancelha, color: cores.destaqueTexto },
  textoRascunho: { ...fonte.corpo, color: cores.texto },
});
