/* =========================================================
   SUMA · Carrusel de Instagram
   No modifica las funciones del portal ni los planes.
   Las publicaciones se administran desde Pages CMS.
   ========================================================= */

(() => {
  'use strict';

  const root = document.querySelector('#homeArea .section-heading');
  if (!root) return;

  const section = document.createElement('section');
  section.className = 'instagram-novedades';
  section.setAttribute('aria-label', 'Novedades de SUMA en Instagram');
  section.hidden = true;
  section.innerHTML = `
    <div class="instagram-heading">
      <div>
        <h2>Novedades</h2>
        <p>Lo último de SUMA en Instagram</p>
      </div>
      <a class="instagram-perfil" href="https://www.instagram.com/suma_exactas/"
         target="_blank" rel="noopener noreferrer">@suma_exactas ↗</a>
    </div>
    <div class="instagram-carrusel">
      <button class="instagram-control" type="button" data-direccion="-1"
              aria-label="Ver publicaciones anteriores">‹</button>
      <div class="instagram-ventana" tabindex="0" aria-label="Publicaciones de Instagram">
        <div class="instagram-pistas"></div>
      </div>
      <button class="instagram-control" type="button" data-direccion="1"
              aria-label="Ver siguientes publicaciones">›</button>
    </div>
    <p class="instagram-ayuda">Deslizá para ver más publicaciones.</p>
  `;
  root.before(section);

  const ventana = section.querySelector('.instagram-ventana');
  const pistas = section.querySelector('.instagram-pistas');
  const controles = [...section.querySelectorAll('.instagram-control')];
  let intervalo = null;
  let pausa = false;

  function rutaImagen(valor) {
    const ruta = String(valor || '').trim();
    if (/^https:\/\//i.test(ruta)) return ruta;
    // Pages CMS puede guardar /assets/media, pero el sitio se aloja en un subdirectorio.
    if (ruta.startsWith('/assets/')) return ruta.slice(1);
    return ruta.replace(/^\.\//, '');
  }

  function ir(direccion) {
    const tarjeta = pistas.querySelector('.instagram-publicacion');
    if (!tarjeta) return;
    const paso = tarjeta.getBoundingClientRect().width + 12;
    const destino = ventana.scrollLeft + direccion * paso;
    const final = ventana.scrollWidth - ventana.clientWidth;
    if (direccion > 0 && destino >= final + 3) {
      ventana.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direccion < 0 && destino < -3) {
      ventana.scrollTo({ left: final, behavior: 'smooth' });
    } else {
      ventana.scrollTo({ left: Math.max(0, Math.min(final, destino)), behavior: 'smooth' });
    }
  }

  function iniciarRotacion() {
    if (intervalo !== null || pistas.children.length < 4) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    intervalo = window.setInterval(() => {
      if (!pausa && !document.hidden) ir(1);
    }, 5000);
  }

  function detenerRotacion() {
    if (intervalo !== null) window.clearInterval(intervalo);
    intervalo = null;
  }

  controles.forEach((boton) => {
    boton.addEventListener('click', () => ir(Number(boton.dataset.direccion)));
  });
  section.addEventListener('mouseenter', () => { pausa = true; });
  section.addEventListener('mouseleave', () => { pausa = false; });
  section.addEventListener('focusin', () => { pausa = true; });
  section.addEventListener('focusout', (e) => {
    if (!section.contains(e.relatedTarget)) pausa = false;
  });
  ventana.addEventListener('touchstart', () => { pausa = true; }, { passive: true });
  ventana.addEventListener('touchend', () => { pausa = false; }, { passive: true });

  fetch('contenido/instagram.json', { cache: 'no-store' })
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error('No se encontró contenido/instagram.json');
      return respuesta.json();
    })
    .then((datos) => {
      if (!Array.isArray(datos)) throw new Error('Instagram: se esperaba una lista');
      const publicaciones = datos
        .filter((p) => p && p.publicado && p.imagen && /^https:\/\/(www\.)?instagram\.com\/(p|reel)\//i.test(p.url || ''))
        .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
        .slice(0, 5);

      if (!publicaciones.length) return; // No mostrar un bloque vacío.

      publicaciones.forEach((publicacion) => {
        const enlace = document.createElement('a');
        enlace.className = 'instagram-publicacion';
        enlace.href = publicacion.url;
        enlace.target = '_blank';
        enlace.rel = 'noopener noreferrer';
        enlace.setAttribute('aria-label', `Abrir en Instagram: ${publicacion.titulo || 'Publicación de SUMA'}`);

        const imagen = document.createElement('img');
        imagen.src = rutaImagen(publicacion.imagen);
        imagen.alt = publicacion.titulo || 'Publicación de SUMA';
        imagen.loading = 'lazy';
        imagen.decoding = 'async';
        enlace.append(imagen);
        pistas.append(enlace);
      });
      section.hidden = false;
      iniciarRotacion();
    })
    .catch((error) => console.warn('No se cargaron las novedades de Instagram:', error));

  window.addEventListener('pagehide', detenerRotacion);
})();
