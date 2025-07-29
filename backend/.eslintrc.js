module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // 코드 품질 규칙
    'no-console': 'off', // 서버에서는 console.log 허용
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      caughtErrors: 'none', // catch 블록의 error 파라미터는 무시
      ignoreRestSiblings: true // 구조 분해에서 나머지 형제 무시
    }],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',

    // 보안 관련 규칙
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // 성능 관련 규칙 (프로덕션 환경에서는 더 관대하게)
    'no-await-in-loop': 'off', // 데이터 처리 스크립트에서 필요할 수 있음
    'no-unreachable-loop': 'error',
    'no-useless-catch': 'off', // 로깅이나 추가 처리가 있을 수 있음

    // 코드 스타일 규칙 (프로덕션에서는 warning으로 완화)
    'indent': ['warn', 2, {
      'SwitchCase': 1,
      'ignoredNodes': ['ConditionalExpression']
    }],
    'quotes': ['warn', 'single', {
      'avoidEscape': true,
      'allowTemplateLiterals': true
    }],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'key-spacing': ['warn', { 'afterColon': true }],
    'space-before-blocks': 'warn',
    'space-infix-ops': 'warn',
    'eol-last': 'warn',
    'no-trailing-spaces': 'warn',

    // 함수 관련 규칙 (완화)
    'func-style': 'off', // 다양한 함수 스타일 허용
    'arrow-spacing': 'warn',
    'no-confusing-arrow': 'warn',

    // ES6+ 규칙 (완화)
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'template-curly-spacing': 'warn',
    'object-shorthand': 'warn',
    'prefer-destructuring': 'off', // 구조 분해 할당 강제하지 않음

    // 에러 처리 규칙 (완화)
    'no-throw-literal': 'warn',
    'prefer-promise-reject-errors': 'warn',
    // 추가 완화 규칙
    'no-case-declarations': 'warn',
    'no-prototype-builtins': 'warn',
    'no-useless-escape': 'warn',
    'no-dupe-keys': 'error', // 중복 키는 에러 유지

    // Node.js 특화 규칙
    'no-process-exit': 'off', // 서버에서는 process.exit 허용
    'no-path-concat': 'error',
    'handle-callback-err': 'error'
  },
  globals: {
    // 글로벌 변수 허용
    'global': 'readonly',
    'process': 'readonly',
    'Buffer': 'readonly',
    '__dirname': 'readonly',
    '__filename': 'readonly'
  },
  overrides: [
    {
      // 테스트 파일에 대한 특별 규칙
      files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off'
      }
    },
    {
      // 설정 파일에 대한 특별 규칙
      files: ['**/*.config.js', '**/config/**/*.js'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      // 스크립트 파일에 대한 특별 규칙
      files: ['**/scripts/**/*.js', '**/cron/**/*.js'],
      rules: {
        'no-console': 'off',
        'no-process-exit': 'off'
      }
    },
    {
      // 메모리 관련 유틸리티 파일 규칙
      files: ['**/memory-*.js', '**/kill-*.js'],
      rules: {
        'no-console': 'off',
        'no-process-exit': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    'logs/',
    'temp/',
    '.env*',
    'memory-analysis-result.json',
    'memory-monitor.log'
  ]
};
