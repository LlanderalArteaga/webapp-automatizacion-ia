# 3.4 Web app para automatización IA

Aplicación web académica para consultar un asistente de tecnologías de la información conectado a un workflow de n8n Cloud y OpenAI. La interfaz está publicada en GitHub Pages y envía las consultas al Webhook de producción de n8n.

- Sitio publicado: https://llanderalarteaga.github.io/webapp-automatizacion-ia/
- Repositorio: https://github.com/LlanderalArteaga/webapp-automatizacion-ia

## Funcionalidad

- Captura tema, nivel, pregunta e integración.
- Envía las consultas sin recargar la página.
- Permite comparar dos rutas en n8n: integración nativa con OpenAI y una solicitud HTTP a Responses API.
- Muestra el estado de la solicitud, los errores y la respuesta recibida.
- Conserva el texto generado como texto seguro y respeta sus saltos de línea.
- Incluye diseño adaptable a computadoras y teléfonos.

## Tecnologías

HTML5, CSS3, Bootstrap 5, JavaScript ES Modules, Fetch API y n8n Cloud. No requiere proceso de compilación ni backend propio.

## Estructura

- index.html: estructura semántica y formulario.
- css/styles.css: estilos y diseño adaptable.
- js/config.js: URL pública del Webhook y opciones de comunicación.
- js/validation.js: validación de los datos del formulario.
- js/api.js: solicitud HTTP y lectura de la respuesta de n8n.
- js/ui.js: estados, mensajes y presentación segura del resultado.
- js/app.js: inicialización y coordinación de la interfaz.
- assets/: favicon y recursos gráficos.
- .gitignore: archivos excluidos del control de versiones.

## Arquitectura y contrato

El navegador envía al Webhook de n8n únicamente estos cuatro campos:

- tema: Inteligencia artificial, Redes, Programación, Bases de datos o Internet de las cosas (IoT).
- nivel: Básico, Intermedio o Avanzado.
- pregunta: texto no vacío de hasta 2000 caracteres; la pertinencia semántica se evalúa con instrucciones en los nodos de IA de n8n.
- integracion: nativo o http.

En n8n, el Webhook valida y normaliza los valores, y Switch dirige la ejecución a la ruta seleccionada. La ruta nativo usa el nodo de OpenAI configurado en n8n. La ruta http usa HTTP Request contra la API de Responses. Ambas rutas terminan en una salida común para Respond to Webhook.

Respuesta exitosa esperada:

    {
      "ok": true,
      "respuesta": "Texto generado por el asistente",
      "tema": "Redes",
      "nivel": "Intermedio",
      "integracion": "nativo"
    }

La interfaz también admite campos informativos no sensibles. Si n8n responde con error, debe devolver un estado HTTP apropiado y un objeto con ok en false y un mensaje comprensible. El texto generado se obtiene y unifica en n8n; la aplicación no depende de la estructura interna de cada proveedor.

## Comunicación entre GitHub Pages y n8n

La aplicación usa la Production URL HTTPS configurada en js/config.js. Esa URL es pública por diseño y no es una contraseña.

La petición usa application/x-www-form-urlencoded. Durante la revisión, el envío JSON provocó una prevalidación CORS OPTIONS que el Webhook no atendió correctamente. El formato URL-encoded evita esa prevalidación en esta solicitud y n8n normaliza sus campos para conservar el contrato lógico. El cliente no usa mode no-cors porque impediría leer la respuesta.

En el Webhook, configura Allowed Origins (CORS) con los orígenes donde se ejecuta la aplicación. Para GitHub Pages el origen es https://llanderalarteaga.github.io; en desarrollo local, Live Server suele usar http://127.0.0.1:5500. Un origen no incluye la ruta del repositorio.

CORS controla qué respuestas puede leer un navegador desde otros orígenes. No autentica usuarios ni impide que alguien invoque el Webhook con otra herramienta.

## Desarrollo local

1. Clona o descarga el repositorio y abre su carpeta en Visual Studio Code.
2. Inicia un servidor local, por ejemplo Live Server. No abras index.html mediante file://, ya que los módulos ES necesitan un origen servido por HTTP.
3. Revisa js/config.js y confirma que WEBHOOK_URL apunte al endpoint que quieres probar. La URL de producción se muestra en el código del navegador y no debe contener credenciales.
4. Abre la dirección local que indique el servidor y envía una consulta.

La aplicación establece un tiempo límite de 45 segundos. Si se alcanza, muestra un error y permite volver a intentar manualmente. No reintenta automáticamente para evitar solicitudes y consumo duplicados.

## Publicación en GitHub Pages

El repositorio está configurado para publicar la rama main desde la carpeta raíz. La dirección publicada es:

https://llanderalarteaga.github.io/webapp-automatizacion-ia/

Para revisar o cambiar la publicación en GitHub:

1. Abre Settings > Pages.
2. En Build and deployment selecciona Deploy from a branch.
3. Elige la rama main y la carpeta /(root), y guarda.
4. Espera a que termine la publicación y abre el sitio con HTTPS.

## Seguridad y uso responsable

- Nunca coloques una API Key de OpenAI en HTML, CSS, JavaScript, GitHub, GitHub Pages ni almacenamiento del navegador. Las credenciales deben permanecer en Credentials de n8n.
- Cualquier persona puede inspeccionar la URL pública del Webhook. CORS no protege el endpoint.
- Aplica en n8n límites de longitud, validación de opciones y, si está disponible, controles de frecuencia y consumo.
- No introduzcas contraseñas ni datos personales sensibles en las preguntas.
- Revisa el consumo durante las pruebas y desactiva o despublica el workflow al concluir la evaluación si ya no debe aceptar solicitudes públicas.

## Pruebas manuales

Comprobaciones reportadas durante el desarrollo:

- El sitio publicado en GitHub Pages consulta el Webhook de producción.
- Las rutas nativo y http devuelven una respuesta nueva y ambas se muestran en la interfaz.
- El sitio funciona en teléfono en orientación vertical y horizontal.
- El indicador de espera aparece durante la solicitud y Limpiar formulario reinicia los campos.
- El formulario bloquea el envío cuando faltan datos o la pregunta supera el máximo de 2000 caracteres.
- No se observaron errores en la consola de GitHub Pages después de varias consultas.

Matriz para completar con los datos y observaciones de la ejecución final:

| Prueba | Entrada | Resultado esperado | Resultado observado | Cumple |
| --- | --- | --- | --- | --- |
| Nivel básico | Tema y pregunta de nivel básico | Explicación adecuada al nivel |  |  |
| Nivel intermedio | Tema y pregunta de nivel intermedio | Explicación adecuada al nivel |  |  |
| Nivel avanzado | Tema y pregunta de nivel avanzado | Explicación adecuada al nivel |  |  |
| Cambio de tema | Probar al menos dos temas | La respuesta corresponde al tema elegido |  |  |
| Campos inválidos | Dejar campos sin seleccionar o pregunta fuera del límite | La interfaz señala el problema y no envía la consulta |  |  |
| Integración nativa | integracion=nativo | Se ejecuta únicamente la ruta nativa y se muestra la respuesta |  |  |
| Integración HTTP | integracion=http | Se ejecuta únicamente la ruta HTTP y se muestra la respuesta |  |  |
| Falla de red o Webhook | Interrumpir temporalmente el acceso durante una prueba controlada | Se informa el error, se conservan los datos y se permite reintentar |  |  |

También conviene comprobar navegación por teclado, foco visible, mensajes de estado con tecnología asistiva y que no sea posible enviar consultas duplicadas mientras una está activa.

## Créditos

Práctica académica: Automatización con n8n y OpenAI.  
Desarrollado por Axel Llanderal Arteaga.

