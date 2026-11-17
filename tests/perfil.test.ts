// Testes das escolhas de áreas e stacks do perfil.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AREAS, GRUPOS_STACK, normalizar, TODAS_STACKS } from '../src/constants/tecnologias.ts';
import { alternarItem, validarAreas, validarStacks } from '../src/lib/validacao.ts';

describe('áreas e stacks do perfil', () => {
  it('a lista de stacks é ampla e sem repetidas', () => {
    assert.ok(TODAS_STACKS.length >= 120, `só ${TODAS_STACKS.length} stacks`);
    assert.equal(new Set(TODAS_STACKS).size, TODAS_STACKS.length);
    for (const nome of ['Python', 'JavaScript', 'Java', 'TypeScript', 'React', 'PostgreSQL']) {
      assert.ok(TODAS_STACKS.includes(nome), `faltou ${nome}`);
    }
    assert.ok(GRUPOS_STACK.length >= 8);
  });

  it('as áreas batem com as aceitas pelo banco (extensoes.sql)', () => {
    assert.deepEqual([...AREAS], [
      'Front-end', 'Back-end', 'Full-stack', 'Mobile', 'Dados e IA', 'DevOps e Nuvem',
      'UI/UX Design', 'Jogos', 'Segurança', 'QA e Testes', 'Embarcados e IoT', 'Estudante',
    ]);
  });

  it('liga e desliga itens respeitando o limite', () => {
    assert.deepEqual(alternarItem([], 'Python', 2), ['Python']);
    assert.deepEqual(alternarItem(['Python'], 'Python', 2), []);
    assert.deepEqual(alternarItem(['Python', 'Go'], 'Rust', 2), ['Python', 'Go']); // limite atingido
  });

  it('valida limites e repetidas', () => {
    assert.equal(validarAreas(['Front-end', 'Back-end', 'Mobile']), null);
    assert.match(validarAreas(['a', 'b', 'c', 'd']) ?? '', /no máximo 3/);
    assert.equal(validarStacks(['Python', 'Python']), 'Há stacks repetidas.');
    assert.match(validarStacks(Array.from({ length: 16 }, (_, i) => `S${i}`)) ?? '', /no máximo 15/);
  });

  it('busca ignora maiúsculas e acentos', () => {
    assert.equal(normalizar('  Segurança '), 'seguranca');
    assert.ok(TODAS_STACKS.some((s) => normalizar(s).includes(normalizar('type'))));
  });
});
