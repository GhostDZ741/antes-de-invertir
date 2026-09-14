/* ============================================================
   ARAB LION MARKETING — config.js
   ------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para dejar la
   landing funcionando. El resto del sitio no tiene ningún dato
   hardcodeado que dependa de un dominio.

   Ver README.md, sección "Poner en marcha el formulario".
   ============================================================ */

window.ALM_CONFIG = {

  /* ----------------------------------------------------------
     1 · DESTINO DE LAS SOLICITUDES                    ← IMPORTANTE
     ----------------------------------------------------------
     Acá va la URL del servicio que recibe el formulario.
     GitHub Pages es un sitio estático: no puede procesar un
     formulario por sí solo. El proyecto trae listo un backend
     gratuito en `backend/Codigo.gs` (Google Apps Script) que
     guarda cada solicitud —con las fotos— en tu Drive y te manda
     un aviso por mail.

     Pegá acá la URL que te devuelve Apps Script al implementarlo.
     Tiene esta forma:

       https://script.google.com/macros/s/AKfycb..... /exec

     Si queda vacío, el formulario funciona en MODO DE PRUEBA:
     valida los campos y comprime las fotos, pero no envía nada, y
     lo avisa en pantalla para que nadie crea que envió.
  */
  FORM_ENDPOINT: "",

  /* ----------------------------------------------------------
     2 · DIRECCIÓN PÚBLICA DEL SITIO
     ----------------------------------------------------------
     La URL donde quede publicado el sitio. Se usa para la etiqueta
     `canonical` y para `og:url`, que son las que le dicen a Google
     y a las redes cuál es la dirección buena.

     Mientras esté vacío, el sitio no declara ninguna dirección en
     lugar de declarar una inventada.

       GitHub Pages  →  https://usuario.github.io/diagnostico/
       Dominio ALM   →  https://alm.com.ar/diagnostico/

     Cuando alm.com.ar vuelva a estar activo, se cambia sólo esta
     línea: no hay que tocar ni el HTML ni el CSS.
  */
  SITIO_URL: "",

  /* ----------------------------------------------------------
     3 · LÍMITES DE LAS FOTOS DEL DIAGNÓSTICO
     ----------------------------------------------------------
     El lector adjunta fotos de su workbook o de su diagnóstico.
     Las fotos de celular pesan varios MB y llegan sin comprimir,
     así que se reducen en el navegador antes de salir.

     `LADO_MAX` es el lado más largo en píxeles: 1600 alcanza de
     sobra para leer una hoja escrita a mano en pantalla.
  */
  FOTOS: {
    MAX: 8,               // cuántas fotos se aceptan
    LADO_MAX: 1600,       // lado más largo, en píxeles
    CALIDAD: 0.82,        // calidad JPEG (0 a 1)
    PESO_MAX_MB: 25       // tope del envío completo, en MB
  },

  /* ----------------------------------------------------------
     4 · CONTACTO DE ALM
     ----------------------------------------------------------
     Los tres primeros son los datos que el autor ya publicó en la
     página legal del libro. El WhatsApp queda pendiente: no está
     en el manuscrito y no se inventa. Mientras esté vacío, esa
     línea no se muestra.
  */
  CONTACTO: {
    EMAIL: "babouabd23@gmail.com",
    INSTAGRAM: "almarktg",
    FACEBOOK: "almarktg",
    WHATSAPP: ""          // ← [AGREGAR WHATSAPP] ej: "5493704123456"
  }
};
