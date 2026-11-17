// Testes do separador de blocos de código (```).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { separarCodigo, temCodigo } from '../src/lib/codigo.ts';

describe('blocos de código nos posts', () => {
  it('texto sem crases fica como texto', () => {
    assert.deepEqual(separarCodigo('Terminei meu app!'), [{ tipo: 'texto', conteudo: 'Terminei meu app!' }]);
    assert.equal(temCodigo('Terminei meu app!'), false);
  });

  it('separa texto, código com linguagem e texto de novo', () => {
    const r = separarCodigo('Olha:\n```tsx\n<Botao titulo="Oi" />\n```\nFicou bom?');
    assert.deepEqual(r, [
      { tipo: 'texto', conteudo: 'Olha:' },
      { tipo: 'codigo', conteudo: '<Botao titulo="Oi" />', linguagem: 'tsx' },
      { tipo: 'texto', conteudo: 'Ficou bom?' },
    ]);
  });

  it('código sem linguagem', () => {
    const r = separarCodigo('```\nselect 1;\n```');
    assert.deepEqual(r, [{ tipo: 'codigo', conteudo: 'select 1;', linguagem: null }]);
  });

  it('código numa linha só não confunde com linguagem', () => {
    const r = separarCodigo('use ```npm test``` para rodar');
    assert.deepEqual(r, [
      { tipo: 'texto', conteudo: 'use ' },
      { tipo: 'codigo', conteudo: 'npm test', linguagem: null },
      { tipo: 'texto', conteudo: ' para rodar' },
    ]);
  });

  it('crases sem fechar: o resto vira código', () => {
    const r = separarCodigo('Erro:\n```js\nconst x =');
    assert.deepEqual(r, [
      { tipo: 'texto', conteudo: 'Erro:' },
      { tipo: 'codigo', conteudo: 'const x =', linguagem: 'js' },
    ]);
  });

  it('bloco vazio é ignorado', () => {
    assert.deepEqual(separarCodigo('oi ``````'), [{ tipo: 'texto', conteudo: 'oi ' }]);
  });
});
