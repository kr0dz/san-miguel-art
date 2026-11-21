# SEO de SMArt — guía de publicación

Objetivo: competir por búsquedas de arte y artistas de San Miguel de Allende, con prioridad para **“San Miguel de Allende art”** y sus intenciones de compra y descubrimiento.

## Arquitectura bilingüe

- Español: `/`, `/obras/`, `/obras/{slug}/`, `/artistas/`, `/artistas/{slug}/`, `/para-artistas/`.
- Inglés: `/en/`, `/en/artworks/`, `/en/artworks/{slug}/`, `/en/artists/`, `/en/artists/{slug}/`, `/en/for-artists/`.
- Las páginas deben usar canonical propio y hreflang recíproco ES/EN. No crear páginas genéricas duplicadas para variaciones mínimas de una palabra clave.
- La portada se enfoca en **San Miguel de Allende art** y **arte en San Miguel de Allende**; las páginas de obras, artistas y encargos atienden búsquedas más concretas.

## Ficha de cada obra — datos obligatorios

1. Artista y título real, en español e inglés.
2. Fotografía real de la obra, con derechos de publicación confirmados.
3. ALT específico en ES y EN, escrito de acuerdo con lo visible en la foto.
4. Descripción individual en ES y EN.
5. URL permanente legible (slug).
6. Técnica, dimensiones, fecha, disponibilidad y precio **solo cuando estén verificados**.
7. Fotografías adicionales con su propio ALT cuando muestren detalles, firma, escala o proceso.

Una descripción ALT útil dice **qué se ve**, no enumera búsquedas. No poner “San Miguel de Allende art” en cada imagen ni repetir idénticos ALT para fotografías distintas. No inventar materiales, medidas, nombres o ubicaciones que no se comprueben.

### Ejemplo basado en una obra del catálogo

- Archivo: `fernando-castaneda-paisaje-al-atardecer.avif`
- ALT ES: `Paisaje al atardecer en una obra de Fernando Castañeda`
- ALT EN: `Sunset landscape artwork by Fernando Castañeda`

El archivo original del proyecto puede conservar su nombre hasta que existan las imágenes originales de mayor calidad y se apruebe su reemplazo. No cambiar un archivo existente sin conservar redirecciones o referencias.

## Automatizaciones implementadas en la rama SEO

- El panel conserva campos de ALT en dos idiomas para obras y ahora también para fotografías de artistas.
- Una ficha publicada no puede guardarse si faltan título, descripción, fotografía o ALT bilingües. Los borradores pueden quedar incompletos.
- `scripts/seo-images.mjs` comprueba imágenes del catálogo y contenido editorial durante el build, informa de ALT faltantes en el HTML público y genera `/sitemap-images.xml`, enlazado desde `robots.txt`.
- Las fichas del catálogo tienen hreflang recíproco, canonical propio y las páginas de obra comparten su imagen en metadatos sociales.

## Imágenes y rendimiento

- Guardar el original de calidad y generar tamaños derivados optimizados cuando esté disponible el flujo de medios (AVIF/WebP y tamaños responsivos).
- No aplicar carga diferida a la imagen principal visible inmediatamente; reservar `loading="lazy"` para imágenes posteriores.
- Conservar crédito, licencia y datos de procedencia si corresponde. Añadir metadatos `ImageObject`/derechos cuando estén confirmados.
- No afirmar que una obra está en venta, tiene un precio concreto o está disponible si aún no se verificó.

## Antes de publicar en producción

- Inspeccionar visualmente las fotografías: en el contenido actual una comparación antes/después usa el mismo recurso y debe reemplazarse por dos imágenes reales.
- Comprobar la lista de errores y advertencias del build.
- Probar las fichas, las rutas ES/EN, la navegación móvil y la calidad de las imágenes.
- Configurar Google Search Console y enviar `/sitemap.xml` y `/sitemap-images.xml`; seguir impresiones, clics y consultas reales.
- La posición #1 en Google no se puede garantizar. Medir el progreso para búsquedas principales y búsquedas por artista, tipo de obra e intención de compra.
