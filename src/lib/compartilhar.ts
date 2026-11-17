import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

import { textoParaCompartilhar } from '@/lib/textoCompartilhar';

/** Endereço que abre a publicação direto (no app: compilai://post/ID; na web: o link da página). */
export function linkDoPost(postId: string) {
  return Linking.createURL(`/post/${postId}`);
}

/**
 * Compartilha pelo menu do sistema. Na web sem esse menu, copia o link.
 * Devolve 'copiado' quando copiou (para a tela avisar) ou 'compartilhado'.
 */
export async function compartilharPost(postId: string, autor: string, texto: string): Promise<'copiado' | 'compartilhado'> {
  const link = linkDoPost(postId);
  const mensagem = textoParaCompartilhar(autor, texto, link);
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share) {
      try {
        await nav.share({ text: mensagem });
        return 'compartilhado';
      } catch {
        // cancelado ou bloqueado: cai para copiar
      }
    }
    if (await copiarNaWeb(link)) return 'copiado';
    // Navegador bloqueou a cópia: mostra o link para a pessoa copiar à mão.
    globalThis.prompt?.('Copie o link da publicação:', link);
    return 'compartilhado';
  }
  await Share.share({ message: mensagem });
  return 'compartilhado';
}

/** Copia na web: tenta a API do navegador e, se for negada, o jeito antigo (textarea + copy). */
async function copiarNaWeb(texto: string): Promise<boolean> {
  try {
    await globalThis.navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const doc = globalThis.document;
      const area = doc.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      doc.body.appendChild(area);
      area.select();
      const ok = doc.execCommand('copy');
      doc.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}
