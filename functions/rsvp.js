const BASE_ID  = 'appj90QxdBdxNrmba'
const TABLE    = 'Confirmaciones'
const AT_URL   = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}`

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { nombre, adultos, ninos, telefono, restricciones, mensaje, email } = body

  if (!nombre?.trim()) return json({ error: 'Nombre requerido' }, 422)
  if (!adultos || Number(adultos) < 1) return json({ error: 'Cantidad de adultos requerida' }, 422)

  const res = await fetch(AT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        'Nombre':                       nombre.trim(),
        'Adultos':                      Number(adultos),
        'Niños/as':                     Number(ninos) || 0,
        'Teléfono':                     telefono?.trim() || '',
        'Restricciones alimentarias':   restricciones?.trim() || '',
        'Mensaje':                      mensaje?.trim() || '',
        'Email':                        email?.trim() || '',
        'Fecha de confirmación':        new Date().toISOString(),
      }
    }),
  })

  const data = await res.json()
  return json(data, res.ok ? 200 : 502)
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
