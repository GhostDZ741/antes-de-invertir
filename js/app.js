/* ============================================================
   ARAB LION MARKETING — app.js
   ------------------------------------------------------------
   Todo lo que hace la página, en un archivo y sin dependencias.

     1 · Configuración y datos de contacto
     2 · Aparición progresiva
     3 · Fotos del diagnóstico (compresión en el navegador)
     4 · Validación
     5 · Envío
     6 · Estados de éxito y de error

   Nada de acá es imprescindible para leer la página: si el
   JavaScript no corre, el contenido se ve igual y el formulario
   se comporta como un formulario común.
   ============================================================ */

(function () {
  'use strict';

  var CFG = window.ALM_CONFIG || {};
  var FOTOS = CFG.FOTOS || {};

  var MAX_FOTOS = FOTOS.MAX || 8;
  var LADO_MAX = FOTOS.LADO_MAX || 1600;
  var CALIDAD = FOTOS.CALIDAD || 0.82;
  var PESO_MAX = (FOTOS.PESO_MAX_MB || 25) * 1024 * 1024;

  var formulario = document.getElementById('formulario');
  var panelExito = document.getElementById('exito');
  var botonEnviar = document.getElementById('enviar');
  var cajaError = document.getElementById('error-envio');
  var entradaFotos = document.getElementById('fotos');
  var listaFotos = document.getElementById('lista-fotos');
  var estadoArchivo = document.getElementById('archivo-estado');
  var avisoPrueba = document.getElementById('aviso-prueba');

  // Lo que el lector adjuntó, ya comprimido, listo para salir.
  var adjuntas = [];


  /* ---------- 1 · CONFIGURACIÓN Y CONTACTO ---------- */

  function aplicarConfig() {
    // La dirección pública. Mientras no esté configurada, las etiquetas
    // se quedan sin declarar: mejor no decir nada que decir una mentira.
    if (CFG.SITIO_URL) {
      var canonica = document.getElementById('canonical');
      var ogUrl = document.getElementById('og-url');
      if (canonica) canonica.href = CFG.SITIO_URL;
      if (ogUrl) ogUrl.content = CFG.SITIO_URL;
    }

    // Las fotos de la imagen para compartir necesitan dirección absoluta.
    var absoluta = CFG.SITIO_URL || (location.origin + location.pathname);
    var ogImagen = document.querySelector('meta[property="og:image"]');
    var twImagen = document.querySelector('meta[name="twitter:image"]');
    var url = new URL('assets/img/compartir.png', absoluta).href;
    if (ogImagen) ogImagen.content = url;
    if (twImagen) twImagen.content = url;

    // El tope de fotos se escribe una sola vez, en config.js.
    var cuantos = document.querySelectorAll('[data-max-fotos]');
    for (var i = 0; i < cuantos.length; i++) {
      cuantos[i].textContent = String(MAX_FOTOS);
    }

    // WhatsApp sólo aparece si hay un número configurado: no se inventa.
    var tel = (CFG.CONTACTO || {}).WHATSAPP;
    if (tel) {
      var fila = document.getElementById('pie-whatsapp');
      var enlace = document.getElementById('pie-whatsapp-tel');
      if (fila && enlace) {
        enlace.href = 'https://wa.me/' + String(tel).replace(/\D/g, '');
        enlace.textContent = '+' + String(tel).replace(/\D/g, '');
        fila.hidden = false;
      }
    }

    // Sin destino configurado, se avisa en pantalla. Nadie tiene que
    // creer que envió una solicitud que no salió a ningún lado.
    if (!CFG.FORM_ENDPOINT && avisoPrueba) avisoPrueba.hidden = false;
  }


  /* ---------- 2 · APARICIÓN PROGRESIVA ---------- */

  function animar() {
    // Si el navegador no sabe observar, o quien mira pidió menos
    // movimiento, no se anima nada: el contenido queda a la vista.
    var quieto = window.matchMedia &&
                 window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quieto || !('IntersectionObserver' in window)) return;

    var piezas = document.querySelectorAll(
      '.hero-cuerpo > *, .franja .ancho > *, .analisis li, .claridad li, .tildes li');

    for (var i = 0; i < piezas.length; i++) piezas[i].classList.add('aparece');

    var vistos = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        vistos.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    function mostrar(el) {
      el.classList.add('visible');
      vistos.unobserve(el);
    }

    var pendientes = [];
    for (var j = 0; j < piezas.length; j++) {
      // Lo que ya está en pantalla al cargar aparece sin esperar.
      if (piezas[j].getBoundingClientRect().top < window.innerHeight * 0.92) {
        mostrar(piezas[j]);
      } else {
        vistos.observe(piezas[j]);
        pendientes.push(piezas[j]);
      }
    }

    // Red de seguridad. Si un bloque llegara a pasar de largo sin que el
    // observador lo registre, quedaría invisible para siempre: el texto
    // está, pero nadie lo ve. Acá se barre lo que ya quedó por encima de
    // la pantalla y se muestra. Se revisa sólo lo pendiente, así que el
    // costo es mínimo, y se apaga solo cuando no queda nada.
    var pedido = false;
    function rastro() {
      pedido = false;
      var vivos = [];
      for (var k = 0; k < pendientes.length; k++) {
        var el = pendientes[k];
        if (!el.isConnected) continue;
        if (el.getBoundingClientRect().bottom < 0) mostrar(el);
        else vivos.push(el);
      }
      pendientes = vivos;
      if (!pendientes.length) {
        window.removeEventListener('scroll', pedirRastro);
      }
    }
    function pedirRastro() {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(rastro);
    }
    window.addEventListener('scroll', pedirRastro, { passive: true });

    // Al imprimir no hay scroll: todo tiene que estar a la vista.
    window.addEventListener('beforeprint', function () {
      for (var n = 0; n < pendientes.length; n++) mostrar(pendientes[n]);
      pendientes = [];
      window.removeEventListener('scroll', pedirRastro);
    });
  }


  /* ---------- 3 · FOTOS DEL DIAGNÓSTICO ---------- */

  function pesoTxt(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function decodificar(archivo) {
    // createImageBitmap respeta la orientación EXIF y es más liviano que
    // pasar por un <img>. Si el navegador no lo tiene, se usa el <img>.
    if (window.createImageBitmap) {
      return createImageBitmap(archivo).catch(function () {
        return porEtiqueta(archivo);
      });
    }
    return porEtiqueta(archivo);
  }

  function porEtiqueta(archivo) {
    return new Promise(function (resolver, rechazar) {
      var url = URL.createObjectURL(archivo);
      var im = new Image();
      im.onload = function () { URL.revokeObjectURL(url); resolver(im); };
      im.onerror = function () {
        URL.revokeObjectURL(url);
        rechazar(new Error('No se pudo leer la imagen.'));
      };
      im.src = url;
    });
  }

  function aDataURL(imagen) {
    var ancho = imagen.width || imagen.naturalWidth;
    var alto = imagen.height || imagen.naturalHeight;
    if (!ancho || !alto) return null;

    var escala = Math.min(1, LADO_MAX / Math.max(ancho, alto));
    var w = Math.max(1, Math.round(ancho * escala));
    var h = Math.max(1, Math.round(alto * escala));

    var lienzo = document.createElement('canvas');
    lienzo.width = w;
    lienzo.height = h;
    var ctx = lienzo.getContext('2d');
    // El fondo blanco evita que un PNG con transparencia salga en negro.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(imagen, 0, 0, w, h);
    return lienzo.toDataURL('image/jpeg', CALIDAD);
  }

  function prepararFoto(archivo) {
    return decodificar(archivo).then(function (imagen) {
      var datos = aDataURL(imagen);
      if (!datos) throw new Error('vacía');
      return {
        nombre: archivo.name || 'foto.jpg',
        tipo: 'image/jpeg',
        datos: datos.split(',')[1],
        vista: datos,
        peso: Math.round(datos.length * 0.75)
      };
    }).catch(function () {
      // Formatos que el navegador no sabe abrir (HEIC en Chrome, por
      // ejemplo). Si la foto no es enorme, viaja tal cual llegó: es
      // preferible pesada que ausente.
      if (archivo.size <= 6 * 1024 * 1024) {
        return leerCrudo(archivo).then(function (base64) {
          return {
            nombre: archivo.name || 'foto',
            tipo: archivo.type || 'application/octet-stream',
            datos: base64,
            vista: '',
            peso: archivo.size,
            cruda: true
          };
        });
      }
      return null;
    });
  }

  function leerCrudo(archivo) {
    return new Promise(function (resolver, rechazar) {
      var lector = new FileReader();
      lector.onload = function () {
        var r = String(lector.result);
        resolver(r.slice(r.indexOf(',') + 1));
      };
      lector.onerror = function () { rechazar(new Error('No se pudo leer.')); };
      lector.readAsDataURL(archivo);
    });
  }

  function sumarFotos(archivos) {
    var elegidas = Array.prototype.slice.call(archivos);
    if (!elegidas.length) return;

    // Si se pasó del tope, se toman las primeras y se dice cuántas quedaron
    // afuera: descartarlas en silencio sería perder fotos sin avisar.
    var lugar = MAX_FOTOS - adjuntas.length;
    var descartadas = 0;
    if (elegidas.length > lugar) {
      descartadas = elegidas.length - lugar;
      elegidas = elegidas.slice(0, lugar);
    }

    estadoArchivo.textContent = 'Preparando ' + elegidas.length +
      (elegidas.length === 1 ? ' foto…' : ' fotos…');

    Promise.all(elegidas.map(prepararFoto)).then(function (hechas) {
      var ilegibles = 0;
      hechas.forEach(function (f) {
        if (f) adjuntas.push(f);
        else ilegibles++;
      });

      pintarFotos();
      limpiarError('fotos');

      var quejas = [];
      if (descartadas) {
        quejas.push('el máximo es ' + MAX_FOTOS + ', quedaron ' +
                    descartadas + ' afuera');
      }
      if (ilegibles) {
        quejas.push(ilegibles + (ilegibles === 1
          ? ' no se pudo leer' : ' no se pudieron leer'));
      }
      if (quejas.length) {
        mostrarError('fotos', 'Se agregaron ' + adjuntas.length +
                     ' fotos; ' + quejas.join(' y ') + '.');
      }

      entradaFotos.value = '';
    });
  }

  function pintarFotos() {
    listaFotos.innerHTML = '';
    adjuntas.forEach(function (f, i) {
      var li = document.createElement('li');

      var vista = document.createElement('img');
      if (f.vista) vista.src = f.vista;
      vista.alt = 'Vista previa de ' + f.nombre;

      var nombre = document.createElement('span');
      nombre.className = 'nombre';
      nombre.textContent = f.nombre;

      var peso = document.createElement('span');
      peso.className = 'peso';
      peso.textContent = pesoTxt(f.peso) + (f.cruda ? ' · original' : '');

      var quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.textContent = '×';
      quitar.setAttribute('aria-label', 'Quitar ' + f.nombre);
      quitar.addEventListener('click', function () {
        adjuntas.splice(i, 1);
        pintarFotos();
        if (!adjuntas.length) entradaFotos.value = '';
      });

      li.append(vista, nombre, peso, quitar);
      listaFotos.appendChild(li);
    });

    estadoArchivo.textContent = adjuntas.length
      ? adjuntas.length + (adjuntas.length === 1
          ? ' foto lista para enviar.' : ' fotos listas para enviar.')
      : 'Todavía no elegiste ninguna foto.';
  }

  function pesoTotal() {
    return adjuntas.reduce(function (t, f) { return t + f.peso; }, 0);
  }


  /* ---------- 4 · VALIDACIÓN ---------- */

  var REGLAS = {
    nombre:   { min: 2,  dice: 'Escribí tu nombre.' },
    email:    { email: true, dice: 'Escribí un email válido, así podemos responderte.' },
    whatsapp: { tel: true, dice: 'Escribí tu WhatsApp con código de país.' },
    negocio:  { min: 2,  dice: 'Escribí el nombre de tu negocio.' },
    rubro:    { min: 2,  dice: 'Contá a qué se dedica el negocio.' },
    desafio:  { min: 10, dice: 'Contanos un poco más sobre tu desafío principal.' }
  };

  function limpiarError(id) {
    var campo = document.getElementById(id);
    var caja = document.getElementById('e-' + id);
    if (campo) campo.removeAttribute('aria-invalid');
    if (caja) { caja.hidden = true; caja.textContent = ''; }
  }

  function mostrarError(id, texto) {
    var campo = document.getElementById(id);
    var caja = document.getElementById('e-' + id);
    if (campo) campo.setAttribute('aria-invalid', 'true');
    if (caja) { caja.textContent = texto; caja.hidden = false; }
  }

  function revisarCampo(id) {
    var campo = document.getElementById(id);
    if (!campo) return true;
    var v = (campo.value || '').trim();
    var regla = REGLAS[id];
    var problema = '';

    if (!v) {
      problema = 'Este dato hace falta.';
    } else if (regla) {
      if (regla.min && v.length < regla.min) problema = regla.dice;
      if (regla.email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) problema = regla.dice;
      if (regla.tel && String(v).replace(/\D/g, '').length < 8) problema = regla.dice;
    }

    if (problema) { mostrarError(id, problema); return false; }
    limpiarError(id);
    return true;
  }

  function revisarTodo() {
    var ids = Object.keys(REGLAS);
    var malos = [];
    var primero = null;

    ids.forEach(function (id) {
      if (!revisarCampo(id)) {
        malos.push(id);
        if (!primero) primero = document.getElementById(id);
      }
    });

    var origen = document.getElementById('origen');
    if (origen && !origen.checked) {
      mostrarError('origen', 'Marcá esta casilla para poder continuar.');
      malos.push('origen');
      if (!primero) primero = origen;
    } else {
      limpiarError('origen');
    }

    // Un solo mensaje arriba, con el resumen; los campos ya están marcados.
    if (malos.length) {
      avisar('Revisá los campos marcados: falta completar ' +
             (malos.length === 1 ? 'un dato.' : malos.length + ' datos.'), 'error');
      if (primero) {
        primero.focus({ preventScroll: true });
        primero.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return false;
    }

    ocultarAviso();
    return true;
  }

  function avisar(texto, tipo) {
    cajaError.textContent = texto;
    cajaError.hidden = false;
    if (tipo === 'aviso') {
      cajaError.style.background = '#FBF4E2';
      cajaError.style.borderColor = '#E4D3A6';
      cajaError.style.borderLeftColor = '#BD9E44';
      cajaError.style.color = '#5E4E1C';
    } else {
      cajaError.style.background = '';
      cajaError.style.borderColor = '';
      cajaError.style.borderLeftColor = '';
      cajaError.style.color = '';
    }
  }

  function ocultarAviso() {
    cajaError.hidden = true;
    cajaError.textContent = '';
  }


  /* ---------- 5 · ENVÍO ---------- */

  function armarEnvio() {
    var f = formulario;
    return {
      nombre:   f.nombre.value.trim(),
      email:    f.email.value.trim(),
      whatsapp: f.whatsapp.value.trim(),
      negocio:  f.negocio.value.trim(),
      sitio:    f.sitio.value.trim(),
      rubro:    f.rubro.value.trim(),
      desafio:  f.desafio.value.trim(),
      mejorar:  f.mejorar.value.trim(),
      origen:   f.origen.checked,
      enviado:  new Date().toISOString(),
      idioma:   navigator.language || '',
      pagina:   location.href,
      fotos:    adjuntas.map(function (x) {
        return { nombre: x.nombre, tipo: x.tipo, datos: x.datos };
      })
    };
  }

  function marcarEnviando(si) {
    botonEnviar.setAttribute('aria-busy', si ? 'true' : 'false');
    botonEnviar.disabled = !!si;
    botonEnviar.textContent = si ? 'Enviando' : 'Solicitar mi sesión';
  }

  function enviar() {
    if (!revisarTodo()) return;

    if (!CFG.FORM_ENDPOINT) {
      avisar('El formulario todavía no está conectado a ningún servicio, ' +
             'así que esta solicitud no se envió. Falta pegar la dirección ' +
             'en js/config.js (FORM_ENDPOINT).', 'aviso');
      return;
    }

    if (pesoTotal() > PESO_MAX) {
      avisar('Las fotos pesan demasiado juntas (' + pesoTxt(pesoTotal()) +
             '). Quitá alguna o sacalas con menos resolución.', 'error');
      return;
    }

    // El freno por tiempo evita que el botón quede girando para siempre.
    var control = new AbortController();
    var reloj = setTimeout(function () { control.abort(); }, 120000);

    marcarEnviando(true);
    ocultarAviso();

    fetch(CFG.FORM_ENDPOINT, {
      method: 'POST',
      // text/plain es a propósito: es una petición "simple" y evita el
      // sondeo previo de CORS que Apps Script no responde.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(armarEnvio()),
      signal: control.signal,
      redirect: 'follow'
    })
      .then(function (r) { return r.text(); })
      .then(function (texto) {
        var respuesta = null;
        try { respuesta = JSON.parse(texto); } catch (e) { respuesta = null; }
        if (respuesta && respuesta.ok === false) {
          throw new Error(respuesta.error || 'rechazado');
        }
        exito();
      })
      .catch(function (err) {
        marcarEnviando(false);
        if (err && err.name === 'AbortError') {
          avisar('La conexión tardó más de lo esperado y cancelamos el envío. ' +
                 'Probá de nuevo, o escribinos a ' +
                 ((CFG.CONTACTO || {}).EMAIL || 'nuestro email') +
                 ' con las fotos adjuntas.', 'error');
          return;
        }
        avisar('No pudimos enviar tu solicitud. Revisá los campos e intentá ' +
               'nuevamente. Si vuelve a fallar, escribinos a ' +
               ((CFG.CONTACTO || {}).EMAIL || 'nuestro email') + '.', 'error');
      })
      .then(function () { clearTimeout(reloj); });
  }


  /* ---------- 6 · ESTADOS DE ÉXITO Y DE ERROR ---------- */

  function exito() {
    formulario.hidden = true;
    panelExito.hidden = false;
    // Quien usa lector de pantalla tiene que enterarse de que cambió todo.
    panelExito.focus();
    panelExito.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function volver() {
    panelExito.hidden = true;
    formulario.hidden = false;
    formulario.reset();
    adjuntas = [];
    pintarFotos();
    marcarEnviando(false);
    ocultarAviso();
  }


  /* ---------- ARRANQUE ---------- */

  aplicarConfig();
  animar();

  if (formulario) {
    // La validación se hace al enviar, no mientras se escribe: marcar un
    // campo en rojo antes de que la persona termine de llenarlo es ruido.
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      enviar();
    });

    // Una vez que el campo fue marcado, se limpia al corregirlo.
    ['nombre', 'email', 'whatsapp', 'negocio', 'rubro', 'desafio'].forEach(
      function (id) {
        var campo = document.getElementById(id);
        if (!campo) return;
        campo.addEventListener('blur', function () { revisarCampo(id); });
        campo.addEventListener('input', function () {
          if (campo.getAttribute('aria-invalid') === 'true') revisarCampo(id);
        });
      });

    var origen = document.getElementById('origen');
    if (origen) {
      origen.addEventListener('change', function () { limpiarError('origen'); });
    }

    if (entradaFotos) {
      entradaFotos.addEventListener('change', function (e) {
        sumarFotos(e.target.files);
      });
    }

    var volverBtn = document.querySelector('[data-volver]');
    if (volverBtn) volverBtn.addEventListener('click', function (e) {
      e.preventDefault();
      volver();
      document.getElementById('titulo').scrollIntoView({ behavior: 'smooth' });
    });
  }
})();
