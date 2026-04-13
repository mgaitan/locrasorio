import { defineConfig, loadEnv } from 'vite'

const BASE_ID = 'appj90QxdBdxNrmba'
const TABLE   = 'Confirmaciones'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    build: { outDir: 'dist' },
    server: {
      plugins: [],
      // Dev proxy: intercepts POST /rsvp and forwards to Airtable with the token
      middlewareMode: false,
    },
    plugins: [
      {
        name: 'rsvp-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/rsvp', async (req, res) => {
            if (req.method !== 'POST') {
              res.writeHead(405); res.end(); return
            }
            let raw = ''
            req.on('data', c => raw += c)
            req.on('end', async () => {
              try {
                const body = JSON.parse(raw)
                const { nombre, personas, restricciones, mensaje, email } = body
                const atRes = await fetch(
                  `https://api.airtable.com/v0/${BASE_ID}/${TABLE}`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      fields: {
                        'Nombre':                     (nombre || '').trim(),
                        'Personas':                   Number(personas),
                        'Restricciones alimentarias': (restricciones || '').trim(),
                        'Mensaje':                    (mensaje || '').trim(),
                        'Email':                      (email || '').trim(),
                        'Fecha de confirmación':      new Date().toISOString(),
                      }
                    }),
                  }
                )
                const data = await atRes.json()
                res.writeHead(atRes.ok ? 200 : 502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(data))
              } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: e.message }))
              }
            })
          })
        }
      }
    ]
  }
})
