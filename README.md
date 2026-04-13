# El Locrasorio

Sitio web de la boda de Nati & Martín — 23 de mayo de 2026, El Casco, Garabato, Alta Gracia, Córdoba.

Un locraso y un casorio en el mismo evento.

**Online:** https://locrasorio.pages.dev · (dominio propio próximamente: locrasorio.lat)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Build | [Vite 6](https://vitejs.dev) |
| Estilos | [Tailwind CSS 3](https://tailwindcss.com) + CSS custom |
| JS | Vanilla ES modules |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |
| Edge functions | Cloudflare Pages Functions (`/functions/rsvp.js`) |
| RSVP backend | [Airtable](https://airtable.com) — base `appj90QxdBdxNrmba` |
| Fuentes | Google Fonts — Playfair Display, Dancing Script, Lato |

---

## Estructura

```
locrasorio/
├── index.html              # Todo el sitio (SPA estático)
├── src/
│   ├── style.css           # Tailwind + estilos custom
│   └── main.js             # JS: nav, lightbox, countdown, receta dinámica, RSVP
├── functions/
│   └── rsvp.js             # Cloudflare Pages Function — proxy a Airtable
├── public/
│   └── images/
│       ├── gallery/        # 44 fotos procesadas (HEIC→JPG, rotación EXIF, 1800px max)
│       ├── lugar-01.jpg    # Foto principal del salón
│       ├── ema_locro.jpeg  # Foto de Ema
│       ├── argentina_qatar.jpg  # Foto festejo Qatar 2022
│       └── locro.webp      # Foto del locro
├── scripts/
│   └── process_gallery.py  # Script para procesar/convertir fotos de galería
├── vite.config.js          # Config Vite + proxy dev para /rsvp
├── tailwind.config.js      # Paleta custom: cream, amber, rust, sage, brown
└── .env                    # AIRTABLE_TOKEN (no commitear)
```

---

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:5173
```

El servidor de dev incluye un proxy para `/rsvp` que lee `AIRTABLE_TOKEN` del `.env`.

### Procesar fotos nuevas

Si agregás fotos a `public/images/`, corré el script para convertir, rotar y renombrar:

```bash
# Requiere pillow + pillow-heif
pip install pillow pillow-heif

python3 scripts/process_gallery.py
```

El script excluye las fotos especiales (`ema_locro.jpeg`, `argentina_qatar.jpg`, `locro.webp`) y las venue (`lugar-*.jpg`). Todo lo demás va a `gallery/` ordenado por fecha EXIF.

---

## Deploy

```bash
npm run build                                          # genera dist/
npx wrangler pages deploy dist --project-name locrasorio --branch main
```

### Variables de entorno en producción

En el dashboard de Cloudflare Pages → Settings → Environment variables:

| Variable | Valor |
|----------|-------|
| `AIRTABLE_TOKEN` | Personal Access Token de Airtable |

O vía CLI:
```bash
npx wrangler pages secret put AIRTABLE_TOKEN --project-name locrasorio
```

### Dominio custom

Una vez comprado `locrasorio.lat`:
1. En Cloudflare Pages → Custom domains → Add domain
2. Apuntar nameservers de Namecheap a los de Cloudflare
3. SSL se genera automáticamente

---

## Secciones del sitio

| Sección | ID | Contenido |
|---------|----|-----------|
| Hero | `#inicio` | Countdown, título, CTA |
| Nosotros | `#nosotros` | Galería de fotos (44 imágenes con lightbox) |
| El Lugar | `#lugar` | Fotos del salón, mapa, hospedaje, transporte |
| Preguntas frecuentes | `#faq` | Accordion con 6 preguntas |
| Confirmanos | `#confirmar` | Formulario RSVP → Airtable |
| La Receta | `#receta` | Receta dinámica con selector de comensales |
| El Compromiso | `#compromiso` | Historia de la apuesta del Mundial 2022 |

---

## Airtable

- **Base:** El Locrasorio — Confirmaciones (`appj90QxdBdxNrmba`)
- **Tabla:** Confirmaciones
- **Campos:** Nombre, Adultos, Niños/as, Teléfono, Email, Restricciones alimentarias, Mensaje, Fecha de confirmación
