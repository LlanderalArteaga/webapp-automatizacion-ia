# 3.4 Web app para automatización IA

Aplicación estática para consultar un asistente de tecnologías de la información. El navegador envía Tema, Nivel, Pregunta e Integración a un Webhook HTTPS de n8n. n8n valida los datos y llama a OpenAI con credenciales almacenadas en n8n.

## Estructura

- `index.html`: estructura semántica del formulario y las áreas de estado y respuesta.
- `css/styles.css`: estilos de la interfaz adaptable y accesible.
- `js/config.js`: Production URL pública del Webhook y formato de envío.
- `js/validation.js`: validación de opciones y normalización del texto.
- `js/api.js`: petición Fetch, timeout, lectura JSON y mensajes de error.
- `js/ui.js`: estados, errores y renderizado seguro usando texto.
- `js/app.js`: eventos y coordinación de módulos.
- `assets/favicon.svg`: favicon vectorial.

## Configuración del Webhook

1. En n8n crea un flujo con un nodo **Webhook** y método `POST`. Usa una ruta propia y configuración de respuesta mediante **Respond to Webhook**.
2. Normaliza y valida en n8n los campos `tema`, `nivel`, `pregunta` e `integracion`. Aplica límites de longitud, controla el consumo y permite solo los valores esperados.
3. Usa un nodo **Switch** sobre `integracion`: `nativo` para el nodo OpenAI y `http` para **HTTP Request** contra Responses API. Guarda toda credencial de OpenAI en Credentials de n8n; nunca en el frontend.
4. Unifica ambas ramas y responde JSON con `ok`, `respuesta`, `tema`, `nivel` e `integracion`. Para éxito usa `ok: true`; no incluyas secretos ni encabezados en la respuesta.
5. Prueba primero el flujo con la Test URL desde n8n. Cuando funcione, activa el flujo y copia su **Production URL HTTPS** en `WEBHOOK_URL` de `js/config.js`. La Test URL solo sirve para depuración y no debe quedar publicada.
6. Configura CORS para permitir el origen exacto de GitHub Pages (por ejemplo `https://usuario.github.io`) y revisa que el navegador pueda completar `OPTIONS` para `Content-Type: application/json`. Durante la prueba puede dejarse `*`; antes de publicar es preferible restringirlo a los orígenes exactos. CORS no autentica el Webhook. No uses `mode: no-cors`.
7. Si el Webhook no admite prevalidación `OPTIONS`, confirma el error en DevTools y cambia `REQUEST_FORMAT` a `'form'` en `js/config.js`. En n8n normaliza el cuerpo `application/x-www-form-urlencoded` para conservar los mismos cuatro campos. No cambies a este modo por ensayo sin diagnosticar CORS.

La URL del Webhook es pública y cualquier visitante puede inspeccionarla. CORS no es autenticación. Protege el flujo con validación y límites del lado de n8n, limita caracteres/solicitudes y desactívalo al concluir la evaluación si ya no se necesita. No almacenes preguntas sensibles en el navegador.

### Validación del flujo

Antes de llamar a OpenAI, valida en n8n que `tema`, `nivel`, `pregunta` e `integracion` estén presentes; permite solo las opciones del formulario y limita `pregunta` a 10–2000 caracteres. Para entradas inválidas responde HTTP 400 con JSON como `{ "ok": false, "mensaje": "Selecciona un tema válido." }`. La interfaz mostrará `mensaje` como texto. Para éxito responde HTTP 200 con el contrato indicado arriba.

## Uso local

Abre la carpeta en VS Code y ejecuta `index.html` con una extensión de servidor estático como Live Server. También puedes usar un servidor HTTP estático local. Evita abrir el archivo como `file://`, ya que los módulos ES y las peticiones Fetch requieren un origen HTTP/HTTPS.

Antes de consultar, configura la Production URL en `js/config.js`. La aplicación no simula respuestas: mientras no exista esa URL, muestra un mensaje de configuración pendiente.

En las herramientas del navegador revisa **Console** y **Network**. Confirma que el POST va a la Production URL, que el cuerpo contiene los cuatro campos y que la respuesta tiene el contrato JSON esperado. Si Fetch informa un error de red, comprueba origen/CORS y OPTIONS en n8n; la interfaz no puede corregir CORS o autorización desde el navegador. Revisa en n8n la ejecución asociada para diagnosticar errores 4xx/5xx.

## Publicar en GitHub Pages

1. Crea un repositorio GitHub y sube los archivos de este proyecto.
2. En el repositorio ve a **Settings > Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/(root)`, y guarda.
5. Espera a que GitHub Pages publique el sitio HTTPS. Comprueba la URL tanto en computadora como en móvil.

Los enlaces locales usan rutas relativas, por lo que la aplicación puede servirse desde `https://usuario.github.io/repositorio/`.

## Pruebas manuales y aceptación

- Enviar campos vacíos o una pregunta menor a 10 caracteres: muestra errores junto a los campos y no hace petición.
- Cambiar tema, nivel e integración: los valores seleccionados se envían exactamente como `tema`, `nivel`, `pregunta`, `integracion`.
- Consultar por ambos mecanismos con el flujo real activo: muestra `respuesta`, tema, nivel e integración sin recarga.
- Probar un Webhook sin CORS, fuera de línea o con respuesta no JSON: muestra un mensaje comprensible y conserva el formulario.
- Probar errores 400, 401, 403, 429 y 500 desde configuraciones de prueba en n8n: explica el estado y permite reintento manual; si HTTP 400 incluye `mensaje`, la interfaz presenta ese detalle.
- Durante una petición: muestra el spinner y bloquea envíos duplicados.
- Limpiar: restaura el formulario y oculta el resultado anterior.
- En vista móvil y teclado: no hay desbordamiento horizontal, el foco es visible y controles/mensajes son accesibles.
- Inspeccionar HTML, CSS y JavaScript: no aparece ninguna API Key de OpenAI ni token privado.

El proyecto se considera integrado solo después de comprobar una consulta real al Webhook de producción y ambas ramas de integración.
