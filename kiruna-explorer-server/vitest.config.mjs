import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,  // Abilita le variabili globali di test
    environment: 'jsdom',  // Imposta l'ambiente per i test
    coverage: {
      reporter: ['text', 'lcov'], // Generate 'text' and 'lcov' reports
      exclude: [
        'coverage/',
        'dist/',
        '/node_modules/',
        '/[.]',
        'packages//test?(s)/',
        '/.d.ts',
        '/virtual:*',
        '/x00',
        '**/\x00',
        'cypress/',
        'test?(s)/',
        'test?(-).?(c|m)[jt]s?(x)',
        '**/{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
        '/tests/',
        '/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        '/vitest.{workspace,projects}.[jt]s?(on)',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
        'Utilities/**/*',
        'vitest.config.mjs',
      ]
    },
 
  },
});