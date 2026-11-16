// Testes automáticos das regras "puras" do app (sem tela nem banco).
// Rodar: npm test   (usa o node:test, que já vem com o Node — nada para instalar)
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dataCurta, horaCurta, tempoRelativo } from '../src/lib/datas.ts';
import { ehErroDeRede, mensagemDeErro } from '../src/lib/erros.ts';
import { validarConfirmacao, validarEmail, validarNome, validarSenha } from '../src/lib/validacao.ts';

describe('validação do cadastro e do login', () => {
  it('exige nome', () => {
    assert.equal(validarNome('   '), 'Informe seu nome.');
    assert.equal(validarNome('Bia'), null);
  });

  it('valida o formato do e-mail', () => {
    assert.equal(validarEmail(''), 'Informe seu e-mail.');
    assert.equal(validarEmail('bia'), 'Digite um e-mail válido.');
    assert.equal(validarEmail('bia@compilai'), 'Digite um e-mail válido.');
    assert.equal(validarEmail(' bia@compilai.test '), null);
  });

  it('exige senha com pelo menos 6 caracteres', () => {
    assert.equal(validarSenha(''), 'Informe sua senha.');
    assert.match(validarSenha('123') ?? '', /pelo menos 6/);
    assert.equal(validarSenha('123456'), null);
  });

  it('confere se as senhas são iguais', () => {
    assert.equal(validarConfirmacao('abcdef', ''), 'Repita a senha.');
    assert.equal(validarConfirmacao('abcdef', 'abcdeg'), 'As senhas não são iguais.');
    assert.equal(validarConfirmacao('abcdef', 'abcdef'), null);
  });
});

describe('datas em português', () => {
  const agora = new Date('2026-11-16T15:00:00');

  it('mostra tempo relativo', () => {
    assert.equal(tempoRelativo('2026-11-16T14:59:30', agora), 'agora');
    assert.equal(tempoRelativo('2026-11-16T14:55:00', agora), 'há 5 min');
    assert.equal(tempoRelativo('2026-11-16T12:00:00', agora), 'há 3 h');
    assert.equal(tempoRelativo('2026-11-15T15:00:00', agora), 'há 1 dia');
    assert.equal(tempoRelativo('2026-11-13T15:00:00', agora), 'há 3 dias');
    assert.equal(tempoRelativo('2026-10-01T15:00:00', agora), '01/10/2026');
  });

  it('formata data e hora curtas', () => {
    assert.equal(dataCurta('2026-03-05T09:07:00'), '05/03/2026');
    assert.equal(horaCurta('2026-03-05T09:07:00'), '09:07');
  });
});

describe('mensagens de erro', () => {
  it('reconhece falta de internet (Android/iOS e navegador)', () => {
    assert.equal(ehErroDeRede({ message: 'TypeError: Network request failed' }), true);
    assert.equal(ehErroDeRede({ message: 'TypeError: fetch failed' }), true);
    assert.equal(ehErroDeRede({ message: 'Invalid login credentials' }), false);
  });

  it('traduz os erros do Supabase', () => {
    assert.equal(mensagemDeErro({ message: 'Invalid login credentials' }), 'E-mail ou senha incorretos.');
    assert.match(mensagemDeErro({ message: 'User already registered' }), /já tem cadastro/);
    assert.match(mensagemDeErro({ message: 'Network request failed' }), /Sem conexão/);
    assert.equal(mensagemDeErro({ message: 'algo estranho' }), 'Algo deu errado. Tente novamente.');
  });
});
