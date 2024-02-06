/** @type {import('aegir').PartialOptions} */
export default {
  build: {
    config: {
      platform: 'browser',
      bundle: true
    }
  },
  dependencyCheck: {
    ignore: [
      // npm scripts
      'xo',
    ],
    productionIgnorePatterns: [
      'test.js',
      '**/*.test-d.ts',
      '**/*.spec.[tj]s',
    ]
  }
}
