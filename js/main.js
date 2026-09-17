/* ============================================================
   Casa Bricaña — main.js
   Concepto «Orballo»: el cristal empañado que se despeja.
   Sin framework. GSAP + ScrollTrigger + Lenis por CDN.
   Si el CDN cae, la página se lee entera: la clase has-motion
   solo se enciende cuando GSAP y ScrollTrigger existen de verdad.
   ============================================================ */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var consultaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var gsapListo = !!(window.gsap && window.ScrollTrigger);
  var reduce = consultaReduce.matches;
  var movimiento = gsapListo && !reduce;   // bandera de MOVIMIENTO
  // gsapListo se usa para animar; "movimiento" decide si se mueve algo.
  // El CONTENIDO (contadores, meses, galería) cambia siempre.

  if (gsapListo) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out' });
  }
  if (movimiento) raiz.classList.add('has-motion');

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- 1. Lenis, único motor de scroll ---------- */

  var lenis = null;
  if (movimiento && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      // lerp alto a propósito: con scrub horizontal, el asentamiento lento
      // de Lenis se lee como "la galería va al revés" durante un segundo.
      lerp: 0.18,
      wheelMultiplier: 1,
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function irA(destino) {
    if (lenis) lenis.scrollTo(destino, { offset: -70 });
    else {
      var el = typeof destino === 'string' ? document.querySelector(destino) : destino;
      if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var destino = document.querySelector(id);
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      irA(destino);
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });

  /* ---------- 2. Cabecera y menú móvil ---------- */

  var cabecera = $('#cabecera');
  var nav = $('#nav');
  var boton = $('#hamburguesa');

  function alScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    cabecera.classList.toggle('cabecera--posada', y > window.innerHeight * 0.78);
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  function cerrarMenu() {
    if (!nav.classList.contains('nav--abierto')) return;
    nav.classList.remove('nav--abierto');
    boton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-abierto');
    if (lenis) lenis.start();
  }

  boton.addEventListener('click', function () {
    var abierto = nav.classList.toggle('nav--abierto');
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    document.body.classList.toggle('menu-abierto', abierto);
    if (lenis) { abierto ? lenis.stop() : lenis.start(); }
    if (abierto) { var primero = nav.querySelector('a'); if (primero) primero.focus(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarMenu();
  });

  /* ---------- 3. Aviso de cookies ---------- */

  var banner = $('#cookieBanner');
  var CLAVE = 'bricana-cookies-v1';
  try {
    if (!localStorage.getItem(CLAVE)) banner.hidden = false;
  } catch (e) { banner.hidden = false; }

  $('#cookieAceptar').addEventListener('click', function () {
    banner.hidden = true;
    try { localStorage.setItem(CLAVE, 'visto'); } catch (e) {}
  });

  /* ---------- 4. Mapa solo bajo clic ---------- */

  var mapaBoton = $('#mapaBoton');
  if (mapaBoton) {
    mapaBoton.addEventListener('click', function () {
      var contenedor = $('.llegar__mapa');
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=Boimorto%2C%20A%20Coru%C3%B1a&output=embed';
      marco.title = 'Mapa de la zona de Boimorto (A Coruña)';
      marco.loading = 'lazy';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      marco.setAttribute('allowfullscreen', '');
      contenedor.innerHTML = '';
      contenedor.appendChild(marco);
      var pie = document.createElement('p');
      pie.className = 'mesa__pie';
      pie.style.marginTop = '.6rem';
      pie.textContent = 'El mapa apunta al municipio, no a una finca concreta: la casa es ficticia.';
      contenedor.appendChild(pie);
      if (gsapListo) ScrollTrigger.refresh();
    });
  }

  /* ---------- 5. Formulario de demostración ---------- */

  var formulario = $('#formulario');
  if (formulario) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      var respuesta = $('#formularioRespuesta');
      var nombre = $('#f-nombre').value.trim();
      respuesta.textContent = nombre
        ? 'Gracias, ' + nombre + '. Esto es una demostración: la solicitud no se ha enviado a ninguna parte.'
        : 'Esto es una demostración: el formulario no envía nada ni guarda datos.';
    });
  }

  /* ---------- 6. Contadores (contenido, no adorno) ---------- */

  function pintaNumero(el, valor) {
    el.textContent = Math.round(valor).toLocaleString('es-ES');
  }

  $$('.contador').forEach(function (el) {
    var hasta = parseFloat(el.dataset.hasta);
    var desde = el.dataset.desde ? parseFloat(el.dataset.desde) : 0;
    pintaNumero(el, hasta);
    if (!movimiento) return;
    var obj = { v: desde };
    gsap.to(obj, {
      v: hasta,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: function () { pintaNumero(el, obj.v); },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- 7. El año de la casa (12 meses) ---------- */

  var MESES = [
    { n: 'Enero', t: 'Temporada baja', p: 82, ll: 186, f: 'Niebla hasta el mediodía y la lareira encendida desde las cinco. El mejor mes para no hacer nada.', l: ['Chimenea encendida todos los días', 'Caldo de grelos en la cena', 'Sauna con descuento entre semana'], img: 'lareira', alt: 'Leña ardiendo en una chimenea encendida' },
    { n: 'Febrero', t: 'Temporada baja', p: 82, ll: 154, f: 'Empiezan a abrir las camelias del muro y el robledal todavía está desnudo. Se ve el valle entero desde Solaina.', l: ['Camelias en el muro de la era', 'Ruta del río sin barro (a veces)', 'Dos noches al precio más bajo del año'], img: 'lareira', alt: 'Leña ardiendo en una chimenea encendida' },
    { n: 'Marzo', t: 'Temporada baja', p: 88, ll: 132, f: 'El mes del orballo de verdad: agua fina toda la mañana y sol raso a las cinco de la tarde.', l: ['Primeros grelos de la huerta', 'Botas de agua prestadas, imprescindibles', 'Pájaros a las seis y media en Fento'], img: 'flores', alt: 'Hortensias moradas en flor en el jardín' },
    { n: 'Abril', t: 'Temporada media', p: 98, ll: 118, f: 'Todo verde de golpe. Los peregrinos vuelven al Camino y la casa se llena los fines de semana.', l: ['Huerta recién plantada', 'Enlace con el Camino Francés, 8 km', 'Desayuno en la era si no llueve'], img: 'flores', alt: 'Hortensias moradas en flor en el jardín' },
    { n: 'Mayo', t: 'Temporada media', p: 104, ll: 96, f: 'El mejor mes para andar. Ni frío ni calor, y los días ya son largos hasta las diez.', l: ['Fresas de la huerta en el desayuno', 'Ruta de los hórreos, 9 km', 'Cena fuera, bajo el emparrado'], img: 'horta', alt: 'Cesta de mimbre con verduras recién cogidas de la huerta' },
    { n: 'Junio', t: 'Temporada media', p: 112, ll: 58, f: 'Amanece a las siete menos cuarto en la habitación Fento. Nadie pone el despertador y todos madrugan.', l: ['Guisantes y habas de la huerta', 'Noche de San Juan con hoguera en la era', 'Sauna después de la cuesta de Sanguiñedo'], img: 'horta', alt: 'Cesta de mimbre con verduras recién cogidas de la huerta' },
    { n: 'Julio', t: 'Temporada alta', p: 126, ll: 34, f: 'Calor de interior: treinta grados al mediodía y trece a las siete de la mañana. Se desayuna fuera todos los días.', l: ['Desayuno en la era, 8:30', 'Bicicletas hasta el río', 'Mínimo dos noches'], img: 'prado', alt: 'Camino entre muros de piedra y vegetación cerrada' },
    { n: 'Agosto', t: 'Temporada alta', p: 138, ll: 41, f: 'El mes de las fiestas de las aldeas de alrededor. Conviene reservar con dos meses.', l: ['Tomate de la huerta en todas las comidas', 'Habitación Lousado, la más fresca', 'Mínimo dos noches'], img: 'prado', alt: 'Camino entre muros de piedra y vegetación cerrada' },
    { n: 'Septiembre', t: 'Temporada alta', p: 118, ll: 78, f: 'Higos, uvas y las primeras nieblas de la mañana. Para mucha gente es el mejor mes del año aquí.', l: ['Vendimia de la parra de la casa', 'Setas si ha llovido la semana anterior', 'Baños de río hasta mediados de mes'], img: 'horta', alt: 'Cesta de mimbre con verduras recién cogidas de la huerta' },
    { n: 'Octubre', t: 'Temporada media', p: 98, ll: 162, f: 'Castañas en el magosto y el robledal cambiando de color desde la ventana de Bidueira.', l: ['Magosto en la era el último sábado', 'Chimenea encendida a partir del 15', 'Setas y caza en la cena'], img: 'casa', alt: 'Casa de piedra con el tejado cubierto de musgo y hiedra en la fachada' },
    { n: 'Noviembre', t: 'Temporada baja', p: 82, ll: 204, f: 'El mes más mojado del año. Se sale poco y se lee mucho junto a la lareira.', l: ['Caldo todos los días', 'Sauna incluida dos noches seguidas', 'Silencio absoluto entre semana'], img: 'lareira', alt: 'Leña ardiendo en una chimenea encendida' },
    { n: 'Diciembre', t: 'Temporada baja', p: 92, ll: 198, f: 'Casa entera para grupos en Navidad, con cena de encargo y la mesa larga puesta para doce.', l: ['Casa completa para 11 personas', 'Cena de Nochebuena por encargo', 'Filloas todas las mañanas'], img: 'lareira', alt: 'Leña ardiendo en una chimenea encendida' }
  ];
  var LLUVIA_MAX = 210;

  var pestanas = $$('.mes');
  var elTemporada = $('#anoTemporada');
  var elNombre = $('#anoNombre');
  var elFrase = $('#anoFrase');
  var elLista = $('#anoLista');
  var elPrecio = $('#anoPrecio');
  var elLluvia = $('#anoLluvia');
  var elNivel = $('#anoNivel');
  var elFoto = $('#anoFoto');
  var elPanel = $('#panel-ano');

  var yaPintado = false;

  function pintaMes(indice, conFoco) {
    var m = MESES[indice];
    if (!m) return;
    pestanas.forEach(function (p, i) {
      var activa = i === indice;
      p.setAttribute('aria-selected', activa ? 'true' : 'false');
      p.tabIndex = activa ? 0 : -1;
      if (activa && conFoco) p.focus();
    });
    elTemporada.textContent = m.t;
    elNombre.textContent = m.n;
    elFrase.textContent = m.f;
    elLista.innerHTML = '';
    m.l.forEach(function (texto) {
      var li = document.createElement('li');
      li.textContent = texto;
      elLista.appendChild(li);
    });
    elPrecio.textContent = m.p;
    elLluvia.textContent = m.ll;
    elNivel.style.transform = 'scaleX(' + (m.ll / LLUVIA_MAX).toFixed(3) + ')';
    elFoto.src = 'assets/fotos/' + m.img + '-1600.jpg';
    elFoto.srcset = 'assets/fotos/' + m.img + '-800.jpg 800w, assets/fotos/' + m.img + '-1600.jpg 1600w';
    elFoto.alt = m.alt;
    elPanel.setAttribute('aria-labelledby', 'mes-' + (indice + 1));
    if (movimiento && yaPintado) {
      gsap.fromTo(elPanel, { opacity: .35 }, { opacity: 1, duration: .45, ease: 'power2.out', immediateRender: false });
    }
    yaPintado = true;
  }

  pestanas.forEach(function (p, i) {
    p.addEventListener('click', function () { pintaMes(i); });
    p.addEventListener('keydown', function (e) {
      var salto = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!salto) return;
      e.preventDefault();
      pintaMes((i + salto + 12) % 12, true);
    });
  });

  // Al entrar en la sección, el mes que toca hoy (el contenido cambia
  // también con movimiento reducido).
  var mesInicial = new Date().getMonth();
  pintaMes(mesInicial);

  /* ---------- 8. Char-reveal ---------- */

  function partirTitular(el) {
    var texto = el.textContent.trim();
    el.setAttribute('aria-label', texto);
    var palabras = texto.split(/\s+/);
    el.textContent = '';
    palabras.forEach(function (palabra, i) {
      var envoltorio = document.createElement('span');
      envoltorio.className = 'palabra';
      envoltorio.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (letra) {
        var s = document.createElement('span');
        s.className = 'letra';
        s.textContent = letra;
        envoltorio.appendChild(s);
      });
      el.appendChild(envoltorio);
      if (i < palabras.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
    return $$('.letra', el);
  }

  var titulares = $$('[data-reveal]');
  if (movimiento) {
    titulares.forEach(function (el) {
      var letras = partirTitular(el);
      if (el.classList.contains('hero__titular')) return; // lo lanza la intro
      gsap.to(letras, {
        y: '0%',
        duration: .9,
        ease: 'power4.out',
        stagger: 0.014,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  }

  /* ---------- 9. Entradas suaves y máscaras ---------- */

  if (movimiento) {
    $$('.casa__texto p, .cifra, .ventana__ficha, .tarjeta, .lista-mesa li, .voz, .reservar__datos, .normas, .formulario, .llegar__lista li, .ano__barra, .ventanas__entrada, .mesa__pie, .voces__aviso, .ano__entrada')
      .forEach(function (el) {
        el.classList.add('aparece');
        gsap.to(el, {
          opacity: 1, y: 0, duration: .9,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      });

    $$('[data-mascara] img').forEach(function (img) {
      gsap.to(img, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.3,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: img, start: 'top 88%', once: true }
      });
    });
  }

  /* ---------- 10. Cinta con velocidad de scroll ---------- */

  var cinta = $('#cintaPista');
  if (cinta && movimiento) {
    var original = cinta.innerHTML;
    cinta.innerHTML = original + original;
    var mitad = cinta.scrollWidth / 2;
    var giro = gsap.to(cinta, {
      x: -mitad,
      duration: 26,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: function (x) { return (parseFloat(x) % mitad) + 'px'; }
      }
    });
    ScrollTrigger.create({
      trigger: '.cinta',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: function (self) {
        var v = Math.abs(self.getVelocity());
        gsap.to(giro, { timeScale: 1 + Math.min(v / 260, 7), duration: .4, overwrite: true });
        gsap.to(giro, { timeScale: 1, duration: 1.4, delay: .35, overwrite: false });
      }
    });
  }

  /* ---------- 11. Galería anclada: las cinco ventanas ---------- */

  var pista = $('#ventanasPista');
  var carro = $('#ventanasCarro');
  var aguja = $('#brujulaAguja');
  var ventanas = $$('.ventana');

  function orientar(indice) {
    if (!aguja || !ventanas[indice]) return;
    var grados = parseFloat(ventanas[indice].dataset.orientacion) || 0;
    if (movimiento) gsap.to(aguja, { rotation: grados, svgOrigin: '60 60', duration: .7, ease: 'power2.out', overwrite: true });
    else aguja.setAttribute('transform', 'rotate(' + grados + ' 60 60)');
  }
  orientar(0);

  if (movimiento && window.matchMedia('(min-width: 901px)').matches) {
    pista.classList.add('ventanas__pista--anclada');
    var recorrido = function () { return Math.max(carro.scrollWidth - pista.clientWidth, 1); };
    gsap.to(carro, {
      x: function () { return -recorrido(); },
      ease: 'none',
      scrollTrigger: {
        trigger: pista,
        start: 'top top',
        end: function () { return '+=' + recorrido(); },
        pin: true,
        scrub: 0.55,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: function (self) {
          var i = Math.round(self.progress * (ventanas.length - 1));
          orientar(i);
        }
      }
    });
  } else if (pista) {
    // Sin movimiento: carrusel normal con scroll horizontal nativo.
    pista.addEventListener('scroll', function () {
      var i = Math.round((pista.scrollLeft / Math.max(carro.scrollWidth - pista.clientWidth, 1)) * (ventanas.length - 1));
      orientar(i);
    }, { passive: true });
  }

  /* ---------- 12. Pila de servicios ---------- */

  if (movimiento) {
    var items = $$('.pila__item');
    items.forEach(function (item, i) {
      if (i === items.length - 1) return;
      gsap.to(item.querySelector('.tarjeta'), {
        scale: 0.945,
        ease: 'none',
        // sin tweens de opacidad: dejan las tarjetas sticky invisibles
        scrollTrigger: {
          trigger: items[i + 1],
          start: 'top bottom',
          end: 'top 18%',
          scrub: true
        }
      });
    });
  }

  /* ---------- 13. Pluviómetro de progreso ---------- */

  var pluv = $('#pluviometro');
  var nivel = $('#pluviometroNivel');
  var cifra = $('#pluviometroCifra');
  if (pluv && gsapListo) {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        var p = self.progress;
        nivel.style.transform = 'scaleY(' + p.toFixed(3) + ')';
        cifra.textContent = Math.round(p * 100) + '%';
        pluv.classList.toggle('pluviometro--visible', p > 0.06 && p < 0.97);
      }
    });
  } else if (pluv) {
    window.addEventListener('scroll', function () {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      var p = alto > 0 ? window.pageYOffset / alto : 0;
      nivel.style.transform = 'scaleY(' + p.toFixed(3) + ')';
      cifra.textContent = Math.round(p * 100) + '%';
      pluv.classList.toggle('pluviometro--visible', p > 0.06 && p < 0.97);
    }, { passive: true });
  }

  /* ---------- 14. Botones magnéticos ---------- */

  if (movimiento && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnetico').forEach(function (el) {
      var x = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
      var y = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
      el.addEventListener('mousemove', function (e) {
        var c = el.getBoundingClientRect();
        x((e.clientX - (c.left + c.width / 2)) * 0.32);
        y((e.clientY - (c.top + c.height / 2)) * 0.42);
      });
      el.addEventListener('mouseleave', function () { x(0); y(0); });
      el.addEventListener('blur', function () { x(0); y(0); });
    });
  }

  /* ---------- 15. Cursor gota ---------- */

  var cursor = $('#cursor');
  var cursorTexto = $('#cursorTexto');
  if (cursor && movimiento && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cx = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3.out' });
    var cy = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); });

    var zonas = [
      { sel: '.ventana__marco', texto: 'mirar' },
      { sel: '.casa__figura, .mesa__figura, .ano__figura', texto: 'la casa' },
      { sel: '.mapa-consent', texto: 'mapa' },
      { sel: '.hero__foto, .hero__cristal', texto: 'limpiar' }
    ];
    zonas.forEach(function (z) {
      $$(z.sel).forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          cursor.classList.add('cursor--grande');
          cursorTexto.textContent = z.texto;
        });
        el.addEventListener('mouseleave', function () {
          cursor.classList.remove('cursor--grande');
          cursorTexto.textContent = '';
        });
      });
    });
  }

  /* ---------- 16. El cristal empañado (canvas del hero) ---------- */

  function iniciarCristal() {
    var lienzo = $('#cristal');
    if (!lienzo) return;
    if (reduce) { lienzo.style.display = 'none'; return; }

    var ctx = lienzo.getContext('2d');
    if (!ctx) { lienzo.style.display = 'none'; return; }

    var ancho = 0, alto = 0, dpr = 1;
    var vaho = document.createElement('canvas');   // sprite de vaho cacheado
    var goma = document.createElement('canvas');   // sprite de borrado suave
    var brillo = document.createElement('canvas'); // sprite de gota
    var gotas = [];
    var despeje = 0;         // 0 = empañado, 1 = limpio (lo mueve el scroll)
    var visible = true;
    var animando = false;
    var lazo = null;

    function medir() {
      var caja = lienzo.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      ancho = Math.max(Math.floor(caja.width), 1);
      alto = Math.max(Math.floor(caja.height), 1);
      lienzo.width = Math.floor(ancho * dpr);
      lienzo.height = Math.floor(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      prepararSprites();
      empanar(1);
      gotas = [];
      for (var i = 0; i < 26; i++) gotas.push(nuevaGota(true));
    }

    function prepararSprites() {
      // Vaho: capa cálida + grano. Se dibuja UNA vez y se reutiliza con
      // drawImage; nunca ctx.filter por fotograma.
      vaho.width = ancho; vaho.height = alto;
      var v = vaho.getContext('2d');
      v.clearRect(0, 0, ancho, alto);
      var deg = v.createLinearGradient(0, 0, 0, alto);
      deg.addColorStop(0, 'rgba(238, 231, 219, 0.90)');
      deg.addColorStop(0.55, 'rgba(232, 222, 206, 0.78)');
      deg.addColorStop(1, 'rgba(214, 204, 188, 0.62)');
      v.fillStyle = deg;
      v.fillRect(0, 0, ancho, alto);
      // grano: puntitos claros dispersos
      v.globalAlpha = 0.5;
      for (var i = 0; i < Math.floor((ancho * alto) / 2600); i++) {
        var r = Math.random() * 2.4 + 0.4;
        v.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,.5)' : 'rgba(180,172,158,.35)';
        v.beginPath();
        v.arc(Math.random() * ancho, Math.random() * alto, r, 0, Math.PI * 2);
        v.fill();
      }
      v.globalAlpha = 1;

      var tamGoma = 150;
      goma.width = goma.height = tamGoma;
      var g = goma.getContext('2d');
      var rad = g.createRadialGradient(tamGoma / 2, tamGoma / 2, 0, tamGoma / 2, tamGoma / 2, tamGoma / 2);
      rad.addColorStop(0, 'rgba(0,0,0,1)');
      rad.addColorStop(0.55, 'rgba(0,0,0,.8)');
      rad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rad;
      g.fillRect(0, 0, tamGoma, tamGoma);

      var tamG = 64;
      brillo.width = brillo.height = tamG;
      var b = brillo.getContext('2d');
      var rb = b.createRadialGradient(tamG * 0.38, tamG * 0.34, 1, tamG / 2, tamG / 2, tamG / 2);
      rb.addColorStop(0, 'rgba(255,255,255,.55)');
      rb.addColorStop(0.45, 'rgba(255,255,255,.10)');
      rb.addColorStop(1, 'rgba(255,255,255,0)');
      b.fillStyle = rb;
      b.beginPath();
      b.arc(tamG / 2, tamG / 2, tamG / 2, 0, Math.PI * 2);
      b.fill();
    }

    function empanar(alfa) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alfa;
      ctx.drawImage(vaho, 0, 0, ancho, alto);
      ctx.globalAlpha = 1;
    }

    function nuevaGota(inicial) {
      return {
        x: Math.random() * ancho,
        y: inicial ? Math.random() * alto : -20,
        r: 3 + Math.random() * 9,
        v: 0,
        espera: Math.random() * 260
      };
    }

    function borrar(x, y, radio, fuerza) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = fuerza;
      ctx.drawImage(goma, x - radio, y - radio, radio * 2, radio * 2);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function fotograma() {
      if (!visible || document.hidden) { animando = false; return; }
      // se vuelve a empañar muy despacio, menos si el scroll ya despejó
      empanar(0.010 * (1 - despeje));
      if (despeje > 0.01) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,' + (despeje * 0.045).toFixed(4) + ')';
        ctx.fillRect(0, 0, ancho, alto);
        ctx.globalCompositeOperation = 'source-over';
      }

      for (var i = 0; i < gotas.length; i++) {
        var g = gotas[i];
        if (g.espera > 0) { g.espera -= 1; continue; }
        g.v += 0.012 * (g.r / 6);
        g.y += g.v;
        borrar(g.x, g.y, g.r * 1.5, 0.85);
        ctx.drawImage(brillo, g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
        if (g.y - g.r > alto) gotas[i] = nuevaGota(false);
      }
      lazo = requestAnimationFrame(fotograma);
    }

    function arrancar() {
      if (animando) return;
      animando = true;
      lazo = requestAnimationFrame(fotograma);
    }

    function limpiarConDedo(e) {
      var caja = lienzo.getBoundingClientRect();
      var punto = e.touches ? e.touches[0] : e;
      var x = punto.clientX - caja.left;
      var y = punto.clientY - caja.top;
      if (x < 0 || y < 0 || x > ancho || y > alto) return;
      borrar(x, y, 46, 0.75);
    }

    medir();
    arrancar();

    var temporizador;
    window.addEventListener('resize', function () {
      clearTimeout(temporizador);
      temporizador = setTimeout(function () { medir(); arrancar(); }, 220);
    });

    window.addEventListener('mousemove', limpiarConDedo, { passive: true });
    lienzo.addEventListener('touchmove', limpiarConDedo, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) arrancar();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        visible = entradas[0].isIntersecting;
        if (visible) arrancar();
      }, { threshold: 0 }).observe(lienzo);
    }

    if (gsapListo) {
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        onUpdate: function (self) { despeje = self.progress; arrancar(); }
      });
    }
  }

  /* ---------- 17. Preloader e intro del hero ---------- */

  function intro() {
    var preloader = $('#preloader');
    var titularHero = $('.hero__titular');

    if (!movimiento) {
      if (preloader) preloader.remove();
      return;
    }

    var letras = $$('.letra', titularHero);
    var tl = gsap.timeline();

    if (preloader) {
      tl.to('.preloader__drop', { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' })
        .to('.preloader__word', { opacity: 1, duration: .5 }, '-=.6')
        .to(preloader, {
          yPercent: -100,
          duration: .9,
          ease: 'power3.inOut',
          onComplete: function () { preloader.remove(); if (gsapListo) ScrollTrigger.refresh(); }
        }, '+=.15');
    }

    tl.to(letras, { y: '0%', duration: 1, ease: 'power4.out', stagger: .012 }, '-=.45')
      .to('.hero__sobre', { opacity: 1, duration: .6 }, '-=.9')
      .to('.hero__entrada', { opacity: 1, duration: .7 }, '-=.6')
      .to('.hero__acciones', { opacity: 1, duration: .7 }, '-=.5')
      .to('.hero__pista', { opacity: 1, duration: .6 }, '-=.4')
      .to('.hero__pie', { opacity: 1, duration: .7 }, '-=.5');

    // red de seguridad: pase lo que pase, el preloader se va
    setTimeout(function () {
      var p = $('#preloader');
      if (p) p.remove();
    }, 4200);
  }

  /* ---------- 18. Arranque ---------- */

  iniciarCristal();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      intro();
      if (gsapListo) ScrollTrigger.refresh();
    });
  } else {
    intro();
  }

  window.addEventListener('load', function () {
    if (gsapListo) ScrollTrigger.refresh();
  });

})();
