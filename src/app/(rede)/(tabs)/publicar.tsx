import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AbasInternas } from '@/components/AbasInternas';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Tela } from '@/components/Tela';
import { cores, espaco, fonte } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { mensagemDeErro } from '@/lib/erros';
import { publicar, TEXTO_MAXIMO } from '@/services/postService';

type AbaPublicar = 'escrever' | 'rascunho';

export default function Publicar() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [aba, setAba] = useState<AbaPublicar>('escrever');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Regra do PDF: de 1 a 500 caracteres depois do trim().
  const tamanho = texto.trim().length;
  const valido = tamanho >= 1 && tamanho <= TEXTO_MAXIMO;
  const passou = tamanho > TEXTO_MAXIMO;

  async function aoPublicar() {
    if (!usuario || !valido || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      await publicar(usuario.id, texto);
      // Sucesso confirmado pelo banco: só agora limpamos o campo e vamos ao Início.
      setTexto('');
      router.navigate('/');
    } catch (e) {
      // Falha: o texto fica no campo para tentar de novo.
      setErro(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
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
            onChangeText={setTexto}
            multiline
            placeholder="Ex.: Terminei a tela de login do meu app em React Native!"
            style={estilos.campoGrande}
            textAlignVertical="top"
            erro={passou ? `Passou do limite de ${TEXTO_MAXIMO} caracteres.` : null}
          />
          <View style={estilos.linhaContador}>
            <Text
              style={[estilos.contador, passou && estilos.contadorErro]}
              accessibilityLabel={`${tamanho} de ${TEXTO_MAXIMO} caracteres`}
            >
              {tamanho}/{TEXTO_MAXIMO}
            </Text>
          </View>
          {erro ? <EstadoErro mensagem={`A publicação não foi enviada. ${erro}`} aoTentarDeNovo={aoPublicar} /> : null}
          <Botao titulo="Publicar" aoPressionar={aoPublicar} desativado={!valido} carregando={enviando} />
        </>
      ) : (
        <EstadoVazio titulo="Rascunho" mensagem="Em construção." />
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  campoGrande: { minHeight: 160, paddingTop: espaco.md },
  linhaContador: { alignItems: 'flex-end', marginTop: -espaco.sm },
  contador: { ...fonte.pequena, color: cores.textoSuave },
  contadorErro: { color: cores.erro, fontWeight: '700' },
});
