
/* ==========================================================
   SUMA Exactas — funcionamiento del portal estudiantil
   Los contenidos se administran desde Pages CMS.
   ========================================================== */

const $ = (id) => document.getElementById(id);

let site = {};
let items = [];
let news = [];
let selected = null;

// Normaliza el texto para búsquedas sin distinguir
// tildes o mayúsculas.
const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Crea elementos HTML sin insertar texto como código.
function node(tag, cls, text) {
  const element = document.createElement(tag);

  if (cls) element.className = cls;
  if (text !== undefined) element.textContent = text;

  return element;
}

const categories = [
  [
    'ingreso',
    '🎒',
    'Ingreso',
    'Inscripción, curso de ingreso y primeros pasos'
  ],
  [
    'cursadas',
    '📚',
    'Carreras y cursadas',
    'Materias, finales, calendarios y planes'
  ],
  [
    'tramites',
    '🗂️',
    'Trámites',
    'Certificados, SIU y gestiones'
  ],
  [
    'bienestar',
    '💜',
    'Vida universitaria',
    'Becas, comedor, boleto y bienestar'
  ],
  [
    'suma',
    '✳️',
    'SUMA',
    'Actividades, propuestas y contacto'
  ]
];

/* ----------------------------------------------------------
   RECURSOS
   Trámites, materiales, PDF y enlaces externos
   ---------------------------------------------------------- */

function resourceCard(resource) {
  const article = node('article', 'resource');

  const category = categories.find(
    (c) => c[0] === resource.categoria
  );

  article.append(
    node('strong', '', resource.titulo || 'Sin título')
  );

  article.append(
    node('div', 'meta', category?.[2] || 'Información')
  );

  if (resource.descripcion) {
    article.append(
      node('p', '', resource.descripcion)
    );
  }

  // Acepta enlaces externos y archivos internos.
  // Ejemplo: assets/planes/ambiental.pdf

  if (resource.url && String(resource.url).trim()) {
    const link = node('a', '', 'Consultar información ↗');

    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    article.append(link);
  }

  if (resource.revisado) {
    article.append(
      node('div', 'date', 'Revisado: ' + resource.revisado)
    );
  }

  return article;
}


/* ==========================================
   CATEGORÍAS DEL PORTAL
   ========================================== */

function renderCategory(code) {

  selected = code;

  const category = categories.find(
    (c) => c[0] === code
  );

  if (!category) return;

  $('categoryTitle').textContent = category[2];
  $('categoryDesc').textContent = category[3];

  const contenedor = $('categoryList');
  contenedor.replaceChildren();

  const recursos = items.filter(
    (item) =>
      item.publicado &&
      item.categoria === code
  );

  // Organización especial de Carreras y cursadas

  if (code === 'cursadas') {

    // Identificamos los planes por la carpeta
    // donde están guardados los PDF.

    const esPlan = (item) =>
      String(item.url || '')
        .includes('assets/planes/');

    const planes = recursos
      .filter(esPlan)
      .sort((a, b) =>
        a.titulo.localeCompare(b.titulo, 'es')
      );

    const calendario = recursos.filter(
      (item) => !esPlan(item)
    );

    // PLANES DE ESTUDIO

    contenedor.append(
      node('h3', '', 'Planes de estudio'),
      node(
        'p',
        '',
        'Seleccioná tu carrera para descargar el PDF.'
      )
    );

    const lista = node('div', 'lista-planes');

    planes.forEach((plan) => {

      const enlace = node('a', 'plan-item');

      enlace.href = plan.url;
      enlace.download = '';

      enlace.append(
        node('span', 'plan-nombre', plan.titulo),
        node('span', 'plan-descarga', '↓ PDF')
      );

      lista.append(enlace);

    });

    contenedor.append(lista);

    // CALENDARIO ACADÉMICO

    contenedor.append(
      node('h3', 'otros-titulo', 'Calendario académico')
    );

    calendario.forEach((item) => {
      contenedor.append(resourceCard(item));
    });

    if (calendario.length === 0) {
      contenedor.append(
        node(
          'p',
          '',
          'Próximamente, información del calendario académico.'
        )
      );
    }

  } else {

    // Todas las demás secciones siguen igual.

    recursos.forEach((item) => {
      contenedor.append(resourceCard(item));
    });

    if (recursos.length === 0) {
      contenedor.append(
        node(
          'p',
          '',
          'Todavía no hay recursos publicados.'
        )
      );
    }

  }

  // Mostrar la sección seleccionada.

  $('homeArea').hidden = true;
  $('searchArea').hidden = true;
  $('categoryArea').hidden = false;

  $('search').value = '';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  location.hash = code;
}

/* ----------------------------------------------------------
   BUSCADOR
   ---------------------------------------------------------- */

function search(query) {
  const q = norm(query.trim());

  if (!q) {
    if (selected) {
      renderCategory(selected);
    } else {
      renderHome();
    }

    return;
  }

  $('categoryArea').hidden = true;
  $('homeArea').hidden = true;
  $('searchArea').hidden = false;

  const matching = items.filter(
    (item) =>
      item.publicado &&
      norm([
        item.titulo,
        item.descripcion,
        item.palabras_clave,
        item.categoria
      ].join(' ')).includes(q)
  );

  $('results').replaceChildren(
    ...matching.map(resourceCard)
  );

  if (!matching.length) {
    $('results').append(
      node(
        'p',
        '',
        'No encontramos resultados. Probá otra palabra o escribinos por Instagram.'
      )
    );
  }
}

/* ----------------------------------------------------------
   CARGA DE CONTENIDO
   Información editable desde Pages CMS
   ---------------------------------------------------------- */

async function load() {
  try {
    const paths = [
      'contenido/sitio.json',
      'contenido/recursos.json',
      'contenido/novedades.json'
    ];

    const values = await Promise.all(
      paths.map((path) =>
        fetch(path, { cache: 'no-store' }).then(
          (response) => {
            if (!response.ok) {
              throw Error(path);
            }

            return response.json();
          }
        )
      )
    );

    [site, items, news] = values;

    // Título y descripción de la portada.

    $('heroTitle').textContent =
      site.titulo_portada ||
      'Todo Exactas, en un solo lugar.';

    $('heroDesc').textContent =
      site.descripcion_portada || '';

    // Instagram de SUMA.

    $('instagram').href =
      site.instagram ||
      'https://www.instagram.com/suma_exactas/';

    /* MENÚ DESPLEGABLE */

    const menu = $('menu');

    for (const category of categories) {
      const link = node('a', '', category[2]);

      link.href = '#' + category[0];

      link.onclick = (event) => {
        event.preventDefault();

        renderCategory(category[0]);

        menu.hidden = true;

        $('menuBtn').setAttribute(
          'aria-expanded',
          'false'
        );
      };

      menu.append(link);
    }

    /* TARJETAS DE CATEGORÍAS */

    for (const category of categories) {
      const tile = node('button', 'tile');

      tile.append(
        node('div', 'symbol', category[1]),
        node('strong', '', category[2]),
        node('span', '', category[3])
      );

      tile.onclick = () =>
        renderCategory(category[0]);

      $('categories').append(tile);
    }

    /* ACCESOS FRECUENTES */

    items
      .filter(
        (item) => item.publicado && item.destacado
      )
      .slice(0, 6)
      .forEach((item) => {
        const button = node(
          'button',
          '',
          item.titulo
        );

        button.onclick = () => {
          $('search').value = item.titulo;

          search(item.titulo);

          window.scrollTo(0, 0);
        };

        $('quickLinks').append(button);
      });

    /* NOVEDADES VIGENTES */

    news
      .filter(
        (item) =>
          item.publicado &&
          (
            !item.vencimiento ||
            item.vencimiento >=
              new Date().toISOString().slice(0, 10)
          )
      )
      .slice(0, 5)
      .forEach((item) => {
        const article = node(
          'article',
          'resource'
        );

        article.append(
          node('strong', '', item.titulo)
        );

        article.append(
          node('p', '', item.descripcion)
        );

        if (
          item.url &&
          /^https?:\/\//i.test(item.url)
        ) {
          const link = node(
            'a',
            '',
            'Más información ↗'
          );

          link.href = item.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';

          article.append(link);
        }

        $('news').append(article);
      });

    if (!$('news').children.length) {
      $('news').append(
        node(
          'p',
          '',
          'Próximamente publicaremos novedades.'
        )
      );
    }

    /* ABRIR UNA CATEGORÍA DESDE SU ENLACE */

    const initial = location.hash.slice(1);

    if (
      categories.some(
        (category) => category[0] === initial
      )
    ) {
      renderCategory(initial);
    }

  } catch (error) {
    $('categories').replaceChildren(
      node(
        'p',
        '',
        'No se pudieron cargar los contenidos. Para probar localmente, iniciá un servidor web como indica el README.'
      )
    );

    console.error(error);
  }
}

/* ----------------------------------------------------------
   BOTONES Y EVENTOS
   ---------------------------------------------------------- */

$('search').addEventListener(
  'input',
  (event) => search(event.target.value)
);

$('menuBtn').addEventListener('click', () => {
  const menu = $('menu');

  menu.hidden = !menu.hidden;

  $('menuBtn').setAttribute(
    'aria-expanded',
    String(!menu.hidden)
  );
});

$('back').addEventListener(
  'click',
  renderHome
);

$('logo').addEventListener('click', (event) => {
  event.preventDefault();

  renderHome();
});

/* ----------------------------------------------------------
   INICIAR EL PORTAL
   ---------------------------------------------------------- */

load();
