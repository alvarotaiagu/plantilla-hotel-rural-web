# Casa Bricaña — plantilla de web para casa de turismo rural

> **Sitio de demostración. Casa Bricaña es un negocio ficticio**: el nombre, la
> dirección, los teléfonos, los precios, los textos y las opiniones son de
> muestra y no corresponden a ningún establecimiento real. La web lleva
> `noindex, nofollow` a propósito.

Demo: **https://alvarotaiagu.github.io/plantilla-hotel-rural-web/**

Web estática de una sola página (más aviso legal, privacidad y 404). Sin
framework, sin build, sin backend y sin npm: se abre con doble clic. GSAP,
ScrollTrigger y Lenis entran por CDN, y si el CDN cae la página se lee entera.

---

## El concepto: «Orballo»

*Orballo* es la lluvia fina que aquí moja sin que te des cuenta y que deja los
cristales empañados toda la mañana. La casa se presenta como se presenta el
valle desde una ventana de una casa de piedra: **hay que despejar el cristal
para ver lo que hay detrás**.

De ahí sale todo el movimiento de la página, no de una lista de efectos:

- El **hero es un cristal empañado** (canvas). Las gotas condensan, resbalan y
  van dejando trazos limpios por los que se ve el valle. El puntero limpia el
  vaho como un dedo, y el scroll lo despeja del todo.
- Las habitaciones no son «tarjetas»: son **cinco ventanas** con su marco y su
  cruceta, que pasan en horizontal mientras una **brújula** gira hacia la
  orientación de cada una.
- El progreso de lectura es un **pluviómetro** que se va llenando.
- La lluvia media de cada mes es una **probeta** que sube y baja.
- Los titulares entran letra a letra, como el vaho que se va.

---

## Mapa de secciones

| # | Sección | Qué hace |
|---|---|---|
| — | Cabecera | Fija, se «posa» (fondo claro) al salir del hero. Menú móvil a pantalla completa. |
| 01 | Hero «el cristal» | Canvas de vaho y gotas sobre foto del valle, titular con char-reveal, dos CTA magnéticos. |
| — | Cinta | Marquee infinito cuya velocidad depende de la velocidad del scroll. |
| 02 | La casa | Texto editorial, foto con máscara que se abre y cuatro cifras que cuentan. |
| 03 | Las cinco ventanas | Galería anclada con scrub horizontal; brújula que apunta a la orientación de la habitación activa. En móvil, carrusel nativo con *snap*. |
| 04 | Lo que hace la casa por ti | Sticky-stack de cinco tarjetas con ilustración SVG propia. |
| 05 | La mesa | Carta de desayuno, cena y meriendas con precios de muestra. |
| 06 | El año | Doce meses en pestañas: temporada, precio, lluvia, foto y qué se encuentra. Arranca en el mes actual. |
| 07 | Voces | Cuatro opiniones inventadas, marcadas como tales. |
| 08 | Reservar | Datos de contacto, normas de la casa y formulario de demostración que no envía nada. |
| 09 | Cómo llegar | Cuatro accesos y mapa de Google **solo bajo clic**. |
| — | Pie | Sello de demostración, horarios, legal y créditos. |

---

## Qué hay que tocar para reskinearlo a un cliente real

Esto es lo más valioso del repo. Por orden:

1. **Datos del negocio.** Están concentrados y son fáciles de localizar:
   - `index.html`: el bloque `application/ld+json` del `<head>` (schema.org
     `BedAndBreakfast`), la sección `#reservar` y el `<footer>`.
   - **Quitar el sello de demostración** (comentario HTML del principio,
     párrafo `.pie__demo`, avisos de `aviso-legal.html` y `privacidad.html`) y
     **quitar `<meta name="robots" content="noindex, nofollow">`**.
   - Si el cliente tiene valoraciones reales y verificables, se pueden añadir
     como texto. En esta plantilla **no hay `aggregateRating` en el schema** y
     no debe añadirse sin datos reales.
2. **Habitaciones.** Cada `<article class="ventana">` es una habitación. El
   atributo `data-orientacion` son grados (0 = norte, 90 = este, 180 = sur,
   270 = oeste): es lo que mueve la brújula. Se pueden añadir o quitar
   habitaciones sin tocar el JavaScript.
3. **El año.** El array `MESES` de `js/main.js` (líneas ~150) tiene los doce
   meses con temporada, precio, litros de lluvia, frase, lista y foto. Cambiar
   `LLUVIA_MAX` si la escala de la probeta se queda corta.
4. **Paleta y tipografía.** Todo en `:root` de `css/estilo.css`: `--lino`,
   `--arena`, `--fento`, `--oxido`… y las dos familias (`--serif`, `--sans`).
   Cambiar también el `<link>` de Google Fonts y `theme-color`.
5. **Fotos.** En `assets/fotos/`, dos anchos por foto (`-800` y `-1600`). Los
   nombres son semánticos (`valle`, `casa`, `hab-solaina`…), así que basta con
   sustituir los archivos manteniendo el nombre. Mantener `width`/`height` en
   el atributo y actualizar el `alt`.
6. **Logotipo.** Es SVG en línea (la gota con la casita dentro): está en
   `favicon.svg` y repetido en la cabecera y el pie de `index.html`.
7. **Formulario.** `#formulario` no envía nada. Para un cliente real se
   conecta a Formspree, a un `mailto:` o al motor de reservas que use, y se
   quita el párrafo `.formulario__aviso`.
8. **Mapa.** En `js/main.js`, la URL del `iframe` de Google: cambiar la
   consulta por el nombre y la dirección reales. **No quitar el botón**: el
   mapa solo debe cargarse bajo clic, o el aviso de cookies deja de ser cierto.

---

## Accesibilidad y comportamiento degradado

- Sin GSAP (CDN caído, JS bloqueado) la página se ve **entera**: los estados
  «vacíos» viven bajo `html.has-motion`, clase que solo se enciende cuando
  existen `gsap` y `ScrollTrigger`.
- Con `prefers-reduced-motion: reduce` se apaga el movimiento, **no el
  contenido**: los contadores muestran su cifra final, la galería se convierte
  en un carrusel con scroll nativo, las pestañas de los meses siguen
  cambiando el texto, el precio, la lluvia y la foto, y el canvas del hero se
  retira.
- Navegación completa por teclado, foco visible, saltar al contenido,
  `aria-expanded` en el menú, pestañas del año con flechas izquierda/derecha y
  `role="tablist"`.
- Contraste comprobado sobre la paleta (texto `--tinta` sobre `--lino`,
  `--lino` sobre `--fento`).

---

## Créditos

- Fotografías: banco de imágenes Pexels, licencia libre. Autoría y enlaces en
  [`CREDITOS.md`](CREDITOS.md). Ninguna retrata el alojamiento descrito, que no
  existe, y no aparecen menores.
- Logotipo, iconos, ilustraciones de servicios, brújula, pluviómetro y dibujo
  del mapa: SVG dibujados para esta plantilla.
- Tipografías: [Fraunces](https://fonts.google.com/specimen/Fraunces) y
  [Karla](https://fonts.google.com/specimen/Karla), Google Fonts (OFL).
- Movimiento: [GSAP](https://gsap.com) + ScrollTrigger y
  [Lenis](https://github.com/darkroomengineering/lenis), por CDN.

## Decisiones tomadas

- **Nombre inventado y comprobado.** Se buscó «Casa Bricaña» antes de fijarlo:
  no aparece ningún alojamiento con ese nombre. Se descartaron «Casa do
  Orballo» y «Casa do Bidueiro» porque existen negocios reales así llamados.
- **Dirección genérica** en un municipio real (Boimorto, A Coruña) con un lugar
  inventado; el mapa apunta al municipio, nunca a una finca concreta.
- **Teléfonos de muestra** (`981 00 00 00`, `600 00 00 00`) y correo en el
  dominio reservado `.example`, que por definición no existe.
- **Sin motor de reservas.** El sector lo pide, pero un botón que simulase un
  cobro en una demo sería una mentira útil a nadie: el formulario dice lo que
  es.
- **Opiniones inventadas y etiquetadas** como tales, sin plataforma, sin
  estrellas y sin `aggregateRating`.
