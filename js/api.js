import { REQUEST_FORMAT, REQUEST_TIMEOUT_MS, WEBHOOK_URL } from './config.js';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'request' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function statusMessage(status) {
  const messages = {
    400: 'n8n rechazó los datos de la consulta (400). Revisa la validación del Webhook.',
    401: 'El Webhook requiere autorización o la configuración de n8n no es válida (401). Revisa el flujo y sus credenciales.',
    403: 'n8n denegó la solicitud (403). Revisa los permisos y el acceso configurados en el Webhook.',
    429: 'Se alcanzó un límite de solicitudes (429). Espera un momento antes de reintentar.',
    500: 'Ocurrió un error dentro del flujo de n8n (500). Revisa la ejecución del Webhook en n8n.',
    502: 'El servicio conectado a n8n no respondió correctamente (502). Inténtalo más tarde.',
    503: 'El servicio está temporalmente no disponible (503). Inténtalo más tarde.',
    504: 'El servicio tardó demasiado en responder (504). Inténtalo más tarde.',
  };
  return messages[status] ?? `La solicitud no se completó (HTTP ${status}). Revisa la ejecución en n8n.`;
}

function serverMessage(payload) {
  if (payload && typeof payload === 'object' && typeof payload.mensaje === 'string') {
    return payload.mensaje.trim().slice(0, 500);
  }
  return '';
}

function assertResponseContract(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError('n8n devolvió una respuesta JSON con un formato inesperado.', { code: 'contract' });
  }
  if (payload.ok !== true) {
    const detail = serverMessage(payload);
    throw new ApiError(detail || 'n8n no pudo completar la consulta. Revisa la ejecución del flujo e inténtalo de nuevo.', { code: 'workflow' });
  }
  if (typeof payload.respuesta !== 'string' || !payload.respuesta.trim()) {
    throw new ApiError('La respuesta de n8n no incluye el campo de texto "respuesta" esperado.', { code: 'contract' });
  }
  return payload;
}

export async function askAssistant(data) {
  if (!WEBHOOK_URL.trim()) {
    throw new ApiError('Configura la Production URL del Webhook en js/config.js para conectar la aplicación con n8n.', { code: 'configuration' });
  }
  let endpoint;
  try {
    endpoint = new URL(WEBHOOK_URL);
  } catch {
    throw new ApiError('La URL del Webhook en js/config.js no tiene un formato válido.', { code: 'configuration' });
  }
  if (endpoint.protocol !== 'https:') {
    throw new ApiError('La URL configurada debe usar HTTPS y ser la Production URL de n8n.', { code: 'configuration' });
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = { Accept: 'application/json' };
  let body;
  if (REQUEST_FORMAT === 'form') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(data).toString();
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, { method: 'POST', headers, body, signal: controller.signal });
    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      if (!response.ok) throw new ApiError(statusMessage(response.status), { status: response.status, code: 'http' });
      throw new ApiError('n8n respondió, pero el contenido no es JSON. Revisa Respond to Webhook.', { status: response.status, code: 'invalid-json' });
    }
    if (!response.ok) {
      const detail = response.status === 400 ? serverMessage(payload) : '';
      const message = detail ? `Solicitud no válida: ${detail}` : statusMessage(response.status);
      throw new ApiError(message, { status: response.status, code: 'http' });
    }
    return assertResponseContract(payload);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') {
      throw new ApiError('La consulta superó el tiempo de espera. Revisa la ejecución de n8n e inténtalo manualmente otra vez.', { code: 'timeout' });
    }
    if (error instanceof TypeError) {
      throw new ApiError('No se pudo leer la respuesta del Webhook. Puede ser un problema de red o CORS; revisa en n8n el acceso del origen de GitHub Pages y la prevalidación OPTIONS. El frontend no puede corregir la configuración CORS ni la autorización del Webhook.', { code: 'network-or-cors' });
    }
    throw new ApiError('Ocurrió un error al comunicarse con n8n. Inténtalo manualmente otra vez.', { code: 'unknown' });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

