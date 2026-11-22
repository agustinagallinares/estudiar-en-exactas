# SUMA Exactas — portal estudiantil (prototipo v0.1)

Una **base funcional** con portada, buscador, navegación móvil, cinco secciones, recursos y novedades. Diseñada para que los contenidos se editen mediante Pages CMS sin tocar HTML.

## Probar en una computadora

No abras `index.html` con doble clic, porque el navegador puede impedir la lectura de archivos JSON desde `file://`.

1. Descomprimí el ZIP.
2. Abrí una terminal en esta carpeta.
3. Ejecutá `python -m http.server 8000` (o `py -m http.server 8000` en Windows).
4. Visitá `http://localhost:8000`.

## Publicar

1. Creá un repositorio nuevo en GitHub, idealmente en una cuenta u organización controlada por SUMA.
2. Subí **todos** los archivos, incluida la configuración oculta `.pages.yml`.
3. Para **GitHub Pages**, habilitá `Settings → Pages → Deploy from a branch → main / (root)` y usá el URL provisto por GitHub. Para dominio propio, seguí la guía oficial de GitHub Pages.
4. Alternativamente, conectá el repositorio a **Cloudflare Pages** con despliegue automático desde GitHub, sin comando de compilación y directorio raíz (`/`).
5. Para editar por formularios, entrá en https://app.pagescms.org, iniciá sesión con GitHub, instalá la app en el repositorio y abrí el proyecto. La configuración `.pages.yml` ya define los campos editables.
6. Invitá a los militantes autorizados al repositorio con permisos adecuados. No compartan claves de una cuenta única.

**Nota:** El panel de Pages CMS no está alojado dentro del ZIP; se activa conectando el repositorio GitHub a la app. El ZIP por sí solo no permite guardar cambios online.

## Lo que edita el equipo

- **Portada e identidad:** `contenido/sitio.json`.
- **Recursos y trámites:** `contenido/recursos.json`. Elegí una sección, título, descripción, palabras clave y enlace; `publicado` controla la visibilidad y `destacado` los accesos rápidos.
- **Novedades y avisos:** `contenido/novedades.json`. Si cargás una fecha de `vencimiento` en formato AAAA-MM-DD, la novedad se oculta automáticamente después de esa fecha.

## Límites del prototipo

- Los ejemplos de recursos **no son información oficial verificada**. Antes de difundir, completar los enlaces y revisar los datos.
- La búsqueda compara títulos, descripciones y palabras clave; no busca en páginas externas.
- No hay cuentas individuales dentro de la web pública: los permisos de edición dependen de GitHub y Pages CMS.
- Esta versión permite editar recursos, novedades y textos. Para agregar categorías nuevas o cambiar el diseño se necesita modificar la configuración/código. Se puede ampliar para administrar también las categorías desde el panel.
- No implementa flujo de revisión editorial antes de publicar. Para un equipo grande conviene configurar revisión y permisos diferenciados antes de usarlo en producción.

## Recomendaciones organizativas

Definir al menos dos personas administradoras, responsables por sección y una fecha de revisión para cada recurso. Cada cambio queda registrado en GitHub. Evitar publicar información sensible o datos personales en el repositorio público.
