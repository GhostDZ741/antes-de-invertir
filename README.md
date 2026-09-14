# Sesión de Diagnóstico Digital — Landing del Bonus 3

Landing del **bono gratuito** que cierra el ebook *ANTES DE INVERTIR*, de
Abdelhakim Bouk. (Arab Lion Marketing).

No es una página de venta. El libro la ofrece al lector que ya compró:
cuando termina su diagnóstico —el del Bonus 1, con las herramientas del
Bonus 2— entra acá, deja los datos de su negocio y adjunta las fotos de lo
que completó. ALM revisa esa solicitud y coordina la sesión.

El enlace llega al lector por la **última página del Bonus 3**: está
impreso, y también grabado en un código QR. Para cambiar esa dirección,
ver *Cambiar la dirección del sitio* más abajo.

---

## 1 · Qué hay en cada carpeta

```
index.html          la página entera (una sola)
css/estilos.css     todos los estilos
js/config.js        ← EL ÚNICO ARCHIVO QUE HAY QUE EDITAR
js/app.js           el comportamiento: fotos, validación y envío
assets/             fuentes, logos, íconos e imagen para compartir
backend/Codigo.gs   el servidor del formulario (Google Apps Script)
.nojekyll           le dice a GitHub Pages que sirva los archivos tal cual
```

No hay frameworks, ni compilación, ni dependencias: son archivos sueltos
que el navegador abre directamente. Por eso se puede publicar gratis en
GitHub Pages y también abrir desde una carpeta, sin instalar nada.

`assets/fuentes/` son las tipografías del libro (Playfair Display y Source
Sans 3), recortadas a los caracteres que la página usa: pesan 88 KB en
total y viajan con el sitio, así no dependen de ningún servicio externo.

### `backend/` no es parte del sitio

`backend/Codigo.gs` es el programa que recibe las solicitudes. **No se
publica**: GitHub Pages sirve archivos, no ejecuta formularios. Vive en
Google, no en el sitio.

Por eso esta carpeta **queda afuera del repositorio** (lo dice el
`.gitignore`): se queda acá, junto al proyecto del libro. El sitio no la
usa ni la necesita.

---

## 2 · Probarlo en tu computadora

**Doble clic en `index.html`** alcanza para ver la página. Pero así el
formulario no funciona bien, porque el navegador bloquea algunas cosas
cuando se abre un archivo suelto. Para probarlo en serio hace falta
servirlo por HTTP, que son dos líneas:

```bash
cd "ebook proyect/landing"
python -m http.server 8000
```

Y abrir <http://localhost:8000>.

Sin nada configurado el formulario entra en **modo de prueba**: valida los
campos, comprime las fotos y avisa en pantalla que no hay servicio
conectado, pero no envía nada. Sirve para ver cómo se comporta sin
molestar a nadie.

---

## 3 · Publicarlo en GitHub Pages

Son ocho pasos y no hace falta saber git.

**1. Crear el repositorio.** En <https://github.com/new>:

- *Repository name*: `antes-de-invertir`
- *Visibility*: **Public** (Pages gratuito sólo funciona en repositorios
  públicos)
- No marques ninguna casilla de "Initialize this repository".

**2. Subir los archivos.** En el repositorio vacío, clic en
*"uploading an existing file"*. Arrastrá **el contenido** de la carpeta
`landing/` — es decir `index.html`, y las carpetas `css`, `js`, `assets` y
`.nojekyll`. **No arrastres la carpeta `landing`**, sino lo que hay
adentro: si queda una carpeta de más, la dirección del sitio cambia.

Después, *Commit changes*.

> El archivo `.nojekyll` empieza con un punto y GitHub lo puede ocultar en
> la lista. Cargalo igual: si falta, Pages intenta procesar el sitio con
> Jekyll y algunas cosas dejan de funcionar.

**3. Configurar Pages.** *Settings* (arriba a la derecha) → en la columna
izquierda, *Pages*.

**4. Seleccionar la rama.** En *Source*, elegí **Deploy from a branch**.

**5. Seleccionar la carpeta.** En *Branch*, elegí **`main`** y la carpeta
**`/ (root)`**. Guardá con *Save*.

**6. Obtener la dirección.** Volvé a *Pages* y esperá uno o dos minutos.
Arriba de todo aparece:

```
https://ghostdz741.github.io/antes-de-invertir/
```

Esa es la dirección pública. El primer despliegue puede tardar unos
minutos más; si ves un 404, esperá y recargá.

**7. Pegarla en la configuración.** Abrí `js/config.js` y poné esa misma
dirección en `SITIO_URL`, para que la página declare `canonical` y
`og:url` en lugar de no decir nada. Ya está puesta; si el sitio cambia de
dirección, se cambia acá y se sube.

```js
SITIO_URL: "https://ghostdz741.github.io/antes-de-invertir/",
```

**8. Conectar el formulario.** Es el paso que falta para que las
solicitudes empiecen a llegar. Está explicado en la sección 4.

---

## 4 · Poner en marcha el formulario

GitHub Pages no recibe formularios: es un sitio de archivos. El proyecto
trae listo un backend propio, que corre en tu cuenta de Google, es
gratuito y no hay que mantenerlo.

**Paso a paso** (está también en la cabecera de `backend/Codigo.gs`):

1. Entrá a <https://script.google.com> con la cuenta de Google de ALM y
   creá un *Nuevo proyecto*.
2. Borrá lo que trae por defecto y pegá todo el contenido de
   `backend/Codigo.gs`.
3. Revisá la constante `AVISO_A`: ahí llega el aviso de cada solicitud.
4. Guardá con Ctrl+S.
5. Arriba a la derecha: **Implementar** → **Nueva implementación**.
6. En el engranaje 🞂, elegí el tipo **Aplicación web**.
7. Completá:
   - *Descripción*: `Sesión de Diagnóstico Digital`
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier persona**

   ("Cualquier persona" hace falta porque quien completa el formulario no
   tiene cuenta en tu proyecto. La dirección del script es larga y difícil
   de adivinar, y no expone ningún dato: sólo permite enviar.)
8. **Implementar** y autorizá los permisos. Google va a avisar que la
   aplicación no está verificada — es tu propio script: *Configuración
   avanzada* → *Ir a (nombre del proyecto)*.
9. Copiá la **URL de la aplicación web**. Termina en `/exec`.
10. Pegala en `js/config.js`:

```js
FORM_ENDPOINT: "https://script.google.com/macros/s/AKfycb.../exec",
```

Listo. Cada solicitud queda en tu Drive, en una carpeta por persona y con
las fotos adentro, y te llega un aviso por mail con todos los datos.

> El formulario manda el cuerpo como `text/plain` a propósito: así la
> petición es "simple" para el navegador y no dispara el sondeo previo de
> CORS, que Apps Script no contesta. No es un descuido.

### Dónde llegan las solicitudes

```
Mi unidad/
  Solicitudes — Sesión de Diagnóstico Digital/
    2026-09-14 18h32 — María Gómez — Panadería La Espiga/
      solicitud.txt      (los datos, para leer de un vistazo)
      foto-1.jpg
      foto-2.jpg
```

Si además querés una planilla para seguir el estado de cada una, pegá el
ID de una planilla de Google en `HOJA_ID` (adentro de `Codigo.gs`) y cada
envío suma una fila.

---

## 5 · Actualizar la página

Los cambios se hacen **en GitHub, en el navegador**, y no hace falta
instalar nada:

1. Entrá al repositorio y abrí el archivo que querés tocar.
2. Clic en el lápiz ✏️ (arriba a la derecha del archivo).
3. Editá.
4. *Commit changes*.

GitHub Pages vuelve a publicar solo, en uno o dos minutos. Si el cambio no
aparece, recargá con **Ctrl+F5**: el navegador guarda copias de los
archivos viejos.

Si preferís trabajar con git en tu computadora:

```bash
git clone https://github.com/ghostdz741/antes-de-invertir.git
cd antes-de-invertir
# ... editar ...
git add -A
git commit -m "Actualizo el texto de la propuesta"
git push
```

### Publicar desde la terminal, de una sola vez

Si tenés GitHub CLI (`gh`) instalado y con sesión iniciada, los pasos 1, 2, 3
y 4 de más arriba se hacen de un tirón. Desde la carpeta `landing/`:

```bash
git init -b main
git add -A
git commit -m "Landing del Bonus 3 — Sesión de Diagnóstico Digital"
gh repo create antes-de-invertir --public --source=. --push
gh api -X POST repos/ghostdz741/antes-de-invertir/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

El sitio queda en `https://ghostdz741.github.io/antes-de-invertir/` en uno o
dos minutos. Si ya creaste el repositorio antes, salteá la línea de
`gh repo create`.

---

## 6 · Cambiar la dirección del sitio

Cuando `alm.com.ar` vuelva a estar activo, hay dos lugares que apuntan a
la dirección del sitio y conviene cambiarlos juntos:

**a) La landing.** En `js/config.js`:

```js
SITIO_URL: "https://alm.com.ar/diagnostico/",
```

**b) El libro.** En `../libro/sistema/maquetar.py`, la constante
`URL_DIAGNOSTICO`. De ahí salen el texto impreso y el código QR de la
última página del Bonus 3: al cambiarla y volver a armar el PDF, los dos
se rehacen solos y no pueden quedar diciendo cosas distintas.

### Conectar el dominio propio

1. En el repositorio: *Settings* → *Pages* → *Custom domain*. Escribí
   `diagnostico.alm.com.ar` y guardá. GitHub crea un archivo `CNAME` en el
   repositorio con ese nombre.
2. En el panel de tu proveedor de dominio (donde administrás alm.com.ar),
   agregá un registro **CNAME**:

   | Tipo  | Nombre         | Valor                    |
   |-------|----------------|--------------------------|
   | CNAME | `diagnostico`  | `ghostdz741.github.io.`  |

3. Esperá la propagación (de minutos a unas horas) y marcá *Enforce HTTPS*
   en la misma pantalla de Pages. El certificado lo emite GitHub, gratis.

Si en cambio querés el sitio en `alm.com.ar/diagnostico/`, eso se resuelve
con configuración del lado del servidor de ALM, no en GitHub Pages.

---

## 7 · Lo que falta completar

Todo lo que sigue es un dato que **no estaba en el manuscrito ni en los
datos legales**, y que por eso no se inventó. Son tres líneas.

| Dónde | Qué | Estado |
|---|---|---|
| `js/config.js` → `FORM_ENDPOINT` | La URL del servicio que recibe las solicitudes | **Vacío — es lo único que falta para que el formulario funcione.** Hasta que se complete, el formulario avisa en pantalla que está en modo de prueba y no envía nada. Ver sección 4. |
| `js/config.js` → `CONTACTO.WHATSAPP` | El WhatsApp de ALM | **Vacío.** Mientras lo esté, esa fila no se muestra en el pie. Se completa con el número completo, sólo dígitos: `"5493704123456"`. |
| `js/config.js` → `SITIO_URL` | La dirección pública del sitio | ✅ Puesta: `https://ghostdz741.github.io/antes-de-invertir/` |
| `../libro/sistema/maquetar.py` → `URL_DIAGNOSTICO` | La dirección que se imprime y se graba en el QR del libro | ✅ Confirmada por el autor y verificada contra el sitio publicado. Si el sitio se muda, se cambia ahí y se rehace el PDF: el QR no se corrige después de imprimir. |

Los logos, el email (`babouabd23@gmail.com`) y las redes
(Instagram `@almarktg`, Facebook `almarktg`) no son placeholders: son los
datos que el autor ya publica en la página legal del libro.

### Una decisión que conviene revisar

En el formulario, **adjuntar las fotos del diagnóstico es opcional**. Se
dejó así para que nadie abandone la solicitud por no tener las fotos a
mano: el pedido igual llega y las fotos se pueden pedir después.

Si preferís que sean obligatorias, es una palabra. En `index.html`, el
campo de fotos está cerca de la línea 330; agregale `required` al final:

```html
<input type="file" id="fotos" name="fotos" accept="image/*" multiple
       class="entrada-archivo" aria-describedby="..." required>
```

Después de eso, el mensaje de error ya está escrito y se muestra solo.

---

## 8 · Qué se verificó

Antes de dar la página por terminada se probó, con un navegador real:

- **Sin errores.** Ningún error de JavaScript, ningún pedido fallido,
  ningún recurso con respuesta de error.
- **Tres anchos.** 390 px (celular), 768 px (tablet) y 1440 px
  (escritorio): sin desborde horizontal en ninguno.
- **El formulario, de punta a punta:** que avise cuando falta un campo,
  que marque el campo mal cargado, que rechace un email mal escrito, que
  exija la confirmación de origen, que comprima las fotos antes de salir
  (una foto de celular de 454 KB llegó al servidor pesando 161 KB) y que
  la pantalla de solicitud recibida aparezca y se pueda volver.
- **El código QR del libro:** se leyó desde el PDF final a 150, 200, 300 y
  400 ppp, y devuelve la dirección correcta en todos los casos.
