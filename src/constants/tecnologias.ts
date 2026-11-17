// Áreas de atuação e stacks (linguagens/tecnologias) que a pessoa escolhe no perfil.
// Ficam numa lista fixa (e não em texto livre) para dar para FILTRAR pessoas pela stack
// e evitar variações como "js", "Javascript" e "JavaScript" contando como coisas diferentes.

export const MAX_AREAS = 3;
export const MAX_STACKS = 15;

export const AREAS = [
  'Front-end',
  'Back-end',
  'Full-stack',
  'Mobile',
  'Dados e IA',
  'DevOps e Nuvem',
  'UI/UX Design',
  'Jogos',
  'Segurança',
  'QA e Testes',
  'Embarcados e IoT',
  'Estudante',
] as const;

export type Area = (typeof AREAS)[number];

export const GRUPOS_STACK: { grupo: string; itens: string[] }[] = [
  {
    grupo: 'Linguagens',
    itens: [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin',
      'Swift', 'Dart', 'PHP', 'Ruby', 'Scala', 'R', 'Lua', 'Elixir', 'Erlang', 'Haskell',
      'Clojure', 'F#', 'Perl', 'Objective-C', 'Assembly', 'Visual Basic', 'Delphi', 'COBOL',
      'Fortran', 'Julia', 'MATLAB', 'Zig', 'Solidity', 'Groovy', 'Shell/Bash', 'PowerShell',
      'SQL', 'HTML', 'CSS',
    ],
  },
  {
    grupo: 'Front-end',
    itens: [
      'React', 'Next.js', 'Vue.js', 'Nuxt', 'Angular', 'Svelte', 'SvelteKit', 'Astro', 'Remix',
      'jQuery', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Styled Components', 'Redux', 'Zustand',
      'Vite', 'Webpack', 'Three.js',
    ],
  },
  {
    grupo: 'Mobile',
    itens: ['React Native', 'Expo', 'Flutter', 'Jetpack Compose', 'SwiftUI', 'Ionic', '.NET MAUI', 'Android SDK', 'iOS SDK'],
  },
  {
    grupo: 'Back-end',
    itens: [
      'Node.js', 'Express', 'NestJS', 'Fastify', 'Deno', 'Bun', 'Django', 'Flask', 'FastAPI',
      'Spring Boot', '.NET / ASP.NET', 'Laravel', 'Symfony', 'Ruby on Rails', 'Phoenix', 'Gin',
      'GraphQL', 'REST APIs', 'gRPC', 'WebSockets',
    ],
  },
  {
    grupo: 'Banco de dados',
    itens: [
      'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'SQL Server', 'Oracle', 'MongoDB', 'Redis',
      'Firebase', 'Supabase', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'Prisma', 'Neo4j',
    ],
  },
  {
    grupo: 'DevOps e Nuvem',
    itens: [
      'Git', 'GitHub', 'GitHub Actions', 'GitLab CI', 'Docker', 'Kubernetes', 'Linux', 'Nginx',
      'AWS', 'Azure', 'Google Cloud', 'Vercel', 'Netlify', 'Terraform', 'Ansible', 'Jenkins',
    ],
  },
  {
    grupo: 'Dados e IA',
    itens: [
      'Pandas', 'NumPy', 'scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Jupyter', 'Apache Spark',
      'Power BI', 'Tableau', 'Excel', 'OpenAI API', 'LangChain', 'Hugging Face',
    ],
  },
  {
    grupo: 'Jogos e outros',
    itens: [
      'Unity', 'Unreal Engine', 'Godot', 'Roblox Studio', 'Arduino', 'Raspberry Pi', 'Figma',
      'Electron', 'WordPress', 'Jest', 'Cypress', 'Playwright', 'Selenium',
    ],
  },
];

/** Todas as stacks válidas (para conferir o que veio do banco/da tela). */
export const TODAS_STACKS: string[] = GRUPOS_STACK.flatMap((g) => g.itens);

/** Busca sem diferenciar maiúsculas nem acentos ("type" acha "TypeScript"). */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
