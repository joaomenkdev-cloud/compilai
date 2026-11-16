// Configuração do Metro (empacotador do Expo).
// Só é necessária para rodar a versão WEB: o expo-sqlite usa um arquivo .wasm no navegador
// e precisa dos cabeçalhos COOP/COEP (SharedArrayBuffer). No celular nada disso muda.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  middleware(req, res, next);
};

module.exports = config;
