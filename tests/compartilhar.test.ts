import assert from 'node:assert/strict';
import { test } from 'node:test';

import { textoParaCompartilhar } from '../src/lib/textoCompartilhar.ts';

test('compartilhar troca blocos de código por [código]', () => {
  const r = textoParaCompartilhar('Bia', 'Olha:\n```js\nconst a = 1;\n```\nfuncionou', 'x://p/1');
  assert.equal(r, 'Bia no CompilaAí: “Olha: [código] funcionou”\nx://p/1');
});

test('compartilhar corta textos longos em 140 caracteres', () => {
  const r = textoParaCompartilhar('Caio', 'a'.repeat(300), 'L');
  const trecho = r.split('“')[1].split('”')[0];
  assert.equal(trecho.length, 138);
  assert.ok(trecho.endsWith('…'));
});
