// La URL del Webhook es pública. Pega aquí la Production URL de n8n, nunca una API Key.
// Production URL activa. Usa la Test URL solo temporalmente mientras n8n escucha pruebas.
// export const WEBHOOK_URL = 'https://llanderal.app.n8n.cloud/webhook/172df897-7ed2-4569-a14f-ef3ccac21933';
// Test URL para pruebas.
 export const WEBHOOK_URL = 'https://llanderal.app.n8n.cloud/webhook-test/172df897-7ed2-4569-a14f-ef3ccac21933';
// Mantener "json" si n8n admite CORS y la prevalidación OPTIONS.
// Cambiar a "form" solo después de confirmar que el Webhook no admite dicha prevalidación.
export const REQUEST_FORMAT = 'json';
export const REQUEST_TIMEOUT_MS = 45000;
