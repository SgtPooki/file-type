import { dirname, join } from 'node:path'
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as http from 'node:http';
import getPort from 'aegir/get-port'

const __dirname = dirname(fileURLToPath(import.meta.url));

// create an http server that will host the fixture data files. When receiving a request for a fileName, it will return './src/fixtures/data/${fileName}'
async function createFixtureServer() {
  const port = await getPort(3333)
  const fixturesDataFolder = join(__dirname, 'fixture')
  const server = await new Promise((resolve, _reject) => {
    const s = http.createServer(async (req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Request-Method', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if ( req.method === 'OPTIONS' ) {
        res.writeHead(200);
        res.end();
        return;
      }
      const fileName = req.url?.split('/').pop()
      if (fileName) {
        try {
          createReadStream(join(fixturesDataFolder, fileName)).pipe(res)
          res.writeHead(200, {'Content-Type': 'application/octet-stream'})
        } catch (e) {
          console.error(e)
          res.writeHead(500, e.message)
          res.end()
        }
      } else {
        res.writeHead(404)
        res.end()
      }
    }).listen(port, () => resolve(s))
  })

  return {
    server,
    port
  }
}

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
      'test/**'
    ]
  },
  test: {
    async before(_options) {
      const { server: httpServer, port: httpPort } = await createFixtureServer()
      return {
        env: {
          FIXTURE_DATA_SERVER: `http://127.0.0.1:${httpPort}`
        },
        httpServer
      }
    },
    after: async (_options, {httpServer}) => {
      await httpServer.closeAllConnections()
      await httpServer.close()
    }
  },
}
