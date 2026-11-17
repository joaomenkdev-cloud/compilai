import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoErro } from '@/components/EstadoErro';
import { Folha } from '@/components/Folha';
import { SeletorTipo } from '@/components/SeletorTipo';
import { areaToque, cores, espaco, estiloTema, fonte } from '@/constants/tema';
import { mensagemDeErro } from '@/lib/erros';
import type { TipoPost } from '@/services/postService';

type Props = {
  /** "publicação" ou "comentário" (usado nos textos). */
  oQue: 'publicação' | 'comentário';
  textoAtual: string;
  /** Só para publicações: permite trocar o tipo ao editar. */
  tipoAtual?: TipoPost;
  maximo: number;
  /** Salva no banco; se lançar erro, a mensagem aparece e o texto fica no campo. */
  aoSalvar: (texto: string, tipo?: TipoPost) => Promise<void>;
  /** Exclui no banco; idem. */
  aoExcluir: () => Promise<void>;
};

type Etapa = 'fechado' | 'menu' | 'editar' | 'confirmar';

// Botão ⋯ que só aparece para o DONO do post/comentário (quem decide isso é a tela;
// o banco garante de novo pelas políticas RLS editar_proprio / excluir_proprio).
export function MenuDono({ oQue, textoAtual, tipoAtual, maximo, aoSalvar, aoExcluir }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('fechado');
  const [texto, setTexto] = useState(textoAtual);
  const [tipo, setTipo] = useState<TipoPost | undefined>(tipoAtual);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const tamanho = texto.trim().length;
  const valido = tamanho >= 1 && tamanho <= maximo;

  function abrirEditor() {
    setTexto(textoAtual);
    setTipo(tipoAtual);
    setErro(null);
    setEtapa('editar');
  }

  async function executar(acao: () => Promise<void>) {
    setOcupado(true);
    setErro(null);
    try {
      await acao();
      setEtapa('fechado'); // só fecha depois que o banco confirmou
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  }

  const fechar = () => {
    if (!ocupado) setEtapa('fechado');
  };

  return (
    <>
      <Pressable
        onPress={() => setEtapa('menu')}
        accessibilityRole="button"
        accessibilityLabel={`Opções da ${oQue}`}
        hitSlop={6}
        style={({ pressed }) => [estilos.botao, pressed && { backgroundColor: cores.superficieSuave }]}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={cores.textoSuave} />
      </Pressable>

      <Folha
        visivel={etapa === 'menu'}
        aoFechar={fechar}
        titulo={`Sua ${oQue}`}
        acoes={[
          { rotulo: `Editar ${oQue}`, icone: 'create-outline', aoPressionar: abrirEditor },
          {
            rotulo: `Excluir ${oQue}`,
            icone: 'trash-outline',
            perigo: true,
            aoPressionar: () => {
              setErro(null);
              setEtapa('confirmar');
            },
          },
        ]}
      />

      <Folha visivel={etapa === 'editar'} aoFechar={fechar} titulo={`Editar ${oQue}`}>
        <View style={estilos.conteudo}>
          {tipoAtual ? <SeletorTipo rotulo="Tipo" valor={tipo ?? tipoAtual} aoMudar={setTipo} /> : null}
          <CampoTexto
            rotulo="Texto"
            value={texto}
            onChangeText={setTexto}
            multiline
            textAlignVertical="top"
            style={estilos.campo}
            erro={tamanho > maximo ? `Use até ${maximo} caracteres.` : tamanho === 0 ? 'O texto não pode ficar vazio.' : null}
          />
          <Text style={estilos.contador}>
            {tamanho}/{maximo}
          </Text>
          {erro ? <EstadoErro mensagem={`Não salvamos. ${erro}`} /> : null}
          <Botao
            titulo="Salvar alterações"
            icone="checkmark"
            desativado={!valido}
            carregando={ocupado}
            aoPressionar={() => executar(() => aoSalvar(texto, tipo))}
          />
          <Botao titulo="Cancelar" variante="secundario" desativado={ocupado} aoPressionar={fechar} />
        </View>
      </Folha>

      <Folha visivel={etapa === 'confirmar'} aoFechar={fechar} titulo={`Excluir esta ${oQue}?`}>
        <View style={estilos.conteudo}>
          <Text style={estilos.aviso}>
            {oQue === 'publicação'
              ? 'As curtidas, comentários e avisos dela também serão apagados. Não dá para desfazer.'
              : 'O comentário será apagado para todo mundo. Não dá para desfazer.'}
          </Text>
          {erro ? <EstadoErro mensagem={`Não excluímos. ${erro}`} /> : null}
          <Botao
            titulo="Excluir"
            icone="trash-outline"
            variante="perigo"
            carregando={ocupado}
            aoPressionar={() => executar(aoExcluir)}
          />
          <Botao titulo="Cancelar" variante="secundario" desativado={ocupado} aoPressionar={fechar} />
        </View>
      </Folha>
    </>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    botao: { width: areaToque, height: areaToque, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    conteudo: { gap: espaco.md, paddingTop: espaco.xs },
    campo: { minHeight: 120, paddingTop: espaco.md },
    contador: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'right', marginTop: -espaco.sm },
    aviso: { ...fonte.corpo, color: cores.texto },
  }),
);
