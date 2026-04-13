// ── RSVP Form ──
const rsvpForm    = document.getElementById('rsvp-form')
const rsvpSuccess = document.getElementById('rsvp-success')
const rsvpError   = document.getElementById('rsvp-error')
const rsvpSubmit  = document.getElementById('rsvp-submit')

rsvpForm?.addEventListener('submit', async (e) => {
  e.preventDefault()
  rsvpError.classList.add('hidden')

  const data = Object.fromEntries(new FormData(rsvpForm))
  if (!data.nombre?.trim()) return showError('Por favor ingresá tu nombre.')
  if (!data.adultos || Number(data.adultos) < 1) return showError('Indicá cuántos adultos vienen.')

  rsvpSubmit.disabled = true
  rsvpSubmit.textContent = 'Enviando…'

  try {
    const res = await fetch('/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre:        data.nombre,
        adultos:       Number(data.adultos),
        ninos:         Number(data.ninos) || 0,
        telefono:      data.telefono || '',
        restricciones: data.restricciones || '',
        mensaje:       data.mensaje || '',
        email:         data.email || '',
      }),
    })

    if (res.ok) {
      rsvpForm.classList.add('hidden')
      rsvpSuccess.classList.remove('hidden')
    } else {
      const err = await res.json().catch(() => ({}))
      showError(err.error || 'Algo salió mal. Intentá de nuevo.')
      rsvpSubmit.disabled = false
      rsvpSubmit.textContent = 'Confirmar asistencia'
    }
  } catch {
    showError('Error de conexión. Verificá tu internet e intentá de nuevo.')
    rsvpSubmit.disabled = false
    rsvpSubmit.textContent = 'Confirmar asistencia'
  }
})

function showError(msg) {
  rsvpError.textContent = msg
  rsvpError.classList.remove('hidden')
}

// ── Lightbox with navigation & swipe ──
const lightbox = document.createElement('div')
lightbox.id = 'lightbox'
lightbox.innerHTML = `
  <button id="lightbox-close" aria-label="Cerrar">&times;</button>
  <button id="lightbox-prev" aria-label="Anterior">&#8249;</button>
  <img id="lightbox-img" src="" alt="" />
  <button id="lightbox-next" aria-label="Siguiente">&#8250;</button>
  <p id="lightbox-counter"></p>
`
document.body.appendChild(lightbox)

const lbImg     = document.getElementById('lightbox-img')
const lbCounter = document.getElementById('lightbox-counter')
let galleryImgs = []
let lbIndex     = 0

function openLightbox(index) {
  lbIndex = index
  lbImg.src = galleryImgs[index].src
  lbImg.alt = galleryImgs[index].alt || ''
  lbCounter.textContent = `${index + 1} / ${galleryImgs.length}`
  lightbox.classList.add('open')
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lightbox.classList.remove('open')
  document.body.style.overflow = ''
}
function lbNav(dir) {
  lbIndex = (lbIndex + dir + galleryImgs.length) % galleryImgs.length
  lbImg.src = galleryImgs[lbIndex].src
  lbImg.alt = galleryImgs[lbIndex].alt || ''
  lbCounter.textContent = `${lbIndex + 1} / ${galleryImgs.length}`
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox)
document.getElementById('lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); lbNav(-1) })
document.getElementById('lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); lbNav(1) })
lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target === lbImg) closeLightbox() })
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return
  if (e.key === 'Escape')      closeLightbox()
  if (e.key === 'ArrowRight')  lbNav(1)
  if (e.key === 'ArrowLeft')   lbNav(-1)
})

// Touch swipe
let touchStartX = 0
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX }, { passive: true })
lightbox.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 50) lbNav(dx < 0 ? 1 : -1)
})

// Wire up all gallery images
window.addEventListener('DOMContentLoaded', () => {
  galleryImgs = Array.from(document.querySelectorAll('.gallery-grid img'))
  galleryImgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => openLightbox(i))
  })
})

// ── Nav scroll effect ──
const navbar = document.getElementById('navbar')
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled')
  } else {
    navbar.classList.remove('scrolled')
  }
})

// ── Mobile menu toggle ──
const menuBtn = document.getElementById('menu-btn')
const mobileMenu = document.getElementById('mobile-menu')
menuBtn?.addEventListener('click', () => {
  mobileMenu.classList.toggle('open')
  const open = mobileMenu.classList.contains('open')
  menuBtn.setAttribute('aria-expanded', open)
})

// Close mobile menu when a link is clicked
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open')
    menuBtn.setAttribute('aria-expanded', false)
  })
})

// ── Scroll reveal ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.1 }
)

document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('nav a[href^="#"]')

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id
        navLinks.forEach(link => {
          link.classList.remove('text-rust', 'font-bold')
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('text-rust', 'font-bold')
          }
        })
      }
    })
  },
  { threshold: 0.4 }
)

sections.forEach(s => sectionObserver.observe(s))

// ── Countdown ──
function updateCountdown() {
  const wedding = new Date('2026-05-23T12:00:00-03:00')
  const now = new Date()
  const diff = wedding - now

  if (diff <= 0) {
    document.getElementById('countdown')?.remove()
    return
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  const el = document.getElementById('countdown')
  if (el) {
    el.querySelector('[data-days]').textContent    = String(days).padStart(2, '0')
    el.querySelector('[data-hours]').textContent   = String(hours).padStart(2, '0')
    el.querySelector('[data-minutes]').textContent = String(minutes).padStart(2, '0')
  }
}

updateCountdown()
setInterval(updateCountdown, 60_000)

// ── Dynamic recipe ──
function fmtWeight(grams) {
  if (grams < 100) return `${Math.round(grams)} g`
  if (grams < 1000) return `${Math.round(grams / 10) * 10} g`
  const kg = grams / 1000
  return kg % 1 === 0 ? `${kg} kg` : `${kg.toFixed(1)} kg`
}
function fmtLiters(liters) {
  if (liters < 1) return `${Math.round(liters * 1000)} ml`
  return liters % 1 === 0 ? `${liters} L` : `${liters.toFixed(1)} L`
}

function updateRecipe(n) {
  document.querySelectorAll('[data-per-g]').forEach(el => {
    const grams = parseFloat(el.dataset.perG) * n
    if (el.dataset.unit === 'chorizo') {
      const units = Math.round(grams / parseFloat(el.dataset.unitG))
      el.textContent = `${units} chorizos (${fmtWeight(grams)})`
    } else {
      el.textContent = fmtWeight(grams)
    }
  })
  document.querySelectorAll('[data-per-l]').forEach(el => {
    el.textContent = fmtLiters(parseFloat(el.dataset.perL) * n)
  })
  const guestEl = document.getElementById('recipe-guests')
  if (guestEl) guestEl.textContent = n
}

const guestsInput  = document.getElementById('guests-input')
const guestsSlider = document.getElementById('guests-slider')
const guestsDec    = document.getElementById('guests-dec')
const guestsInc    = document.getElementById('guests-inc')

function setGuests(val) {
  const n = Math.min(500, Math.max(5, Math.round(Number(val))))
  if (isNaN(n)) return
  guestsInput.value  = n
  guestsSlider.value = n
  updateRecipe(n)
}

// Warning toast for ≤ 5 guests
const recipeWarning = document.getElementById('recipe-warning')
let warningTimer = null
function checkLocroWarning(n) {
  if (n <= 5) {
    recipeWarning.classList.remove('hidden')
    clearTimeout(warningTimer)
    warningTimer = setTimeout(() => {
      recipeWarning.classList.add('hidden')
      setGuests(10)
    }, 4000)
  } else {
    recipeWarning.classList.add('hidden')
    clearTimeout(warningTimer)
  }
}

guestsInput?.addEventListener('input',  () => { setGuests(guestsInput.value); checkLocroWarning(Number(guestsInput.value)) })
guestsSlider?.addEventListener('input', () => { setGuests(guestsSlider.value); checkLocroWarning(Number(guestsSlider.value)) })
guestsDec?.addEventListener('click', () => { const n = Number(guestsInput.value) - 5; setGuests(n); checkLocroWarning(n) })
guestsInc?.addEventListener('click', () => { const n = Number(guestsInput.value) + 5; setGuests(n); checkLocroWarning(n) })

// initialize at 50
updateRecipe(50)

// ── Add to calendar link ──
const calLink = document.getElementById('cal-link')
if (calLink) {
  // Google Calendar: 2026-05-23 12:00–18:00 ART (UTC-3) = 15:00–21:00 UTC
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text:   'El Locrasorio 🍲 — Nati & Martín',
    dates:  '20260523T150000Z/20260523T210000Z',
    details: 'Un locraso y un casorio en el mismo evento. Sin protocolo, con mucho amor y muchos amigos.\n\nhttps://locrasorio.lat',
    location: 'El Casco, Garabato, Alta Gracia, Córdoba, Argentina',
  })
  calLink.href = `https://calendar.google.com/calendar/render?${params}`
}
