const FIELD_NAMES = ['tema', 'nivel', 'pregunta', 'integracion'];

export function createUI() {
  const form = document.querySelector('#question-form');
  const submitButton = document.querySelector('#submit-button');
  const alertBox = document.querySelector('#form-alert');
  const responseCard = document.querySelector('#response-card');
  const statusTitle = document.querySelector('#status-title');
  const statusMessage = document.querySelector('#status-message');
  const loadingStatus = document.querySelector('#loading-status');
  const question = document.querySelector('#pregunta');
  const questionCount = document.querySelector('#question-count');

  function clearErrors() {
    FIELD_NAMES.forEach((name) => {
      const field = form.elements.namedItem(name);
      const message = document.querySelector(`#${name}-error`);
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      message.textContent = '';
    });
    alertBox.textContent = '';
    alertBox.classList.add('d-none');
  }

  function showErrors(errors) {
    clearErrors();
    FIELD_NAMES.forEach((name) => {
      if (!errors[name]) return;
      const field = form.elements.namedItem(name);
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      document.querySelector(`#${name}-error`).textContent = errors[name];
    });
    const firstInvalid = FIELD_NAMES.find((name) => errors[name]);
    if (firstInvalid) form.elements.namedItem(firstInvalid).focus();
  }

  function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.querySelector('.button-label').textContent = isBusy ? 'Consultando...' : 'Consultar asistente';
    submitButton.querySelector('#submit-spinner').classList.toggle('d-none', !isBusy);
    loadingStatus.classList.toggle('d-none', !isBusy);
    if (isBusy) {
      statusTitle.textContent = 'Preparando tu respuesta';
      statusMessage.textContent = '';
      responseCard.classList.add('d-none');
    }
  }

  function showError(message) {
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
    statusTitle.textContent = 'No se pudo completar';
    statusMessage.textContent = 'Tus datos siguen en el formulario. Corrige la configuración o inténtalo de nuevo.';
    responseCard.classList.add('d-none');
    alertBox.focus();
  }

  function showResponse(payload, submitted) {
    const integration = payload.integracion === 'http' || payload.integracion === 'nativo'
      ? payload.integracion
      : submitted.integracion;
    document.querySelector('#result-topic').textContent = payload.tema || submitted.tema;
    document.querySelector('#result-level').textContent = payload.nivel || submitted.nivel;
    document.querySelector('#result-integration').textContent = integration === 'http'
      ? 'HTTP Request / Responses API'
      : 'Nodo OpenAI';
    document.querySelector('#response-text').textContent = payload.respuesta;
    responseCard.classList.remove('d-none');
    statusTitle.textContent = 'Respuesta lista';
    statusMessage.textContent = 'Tu consulta se procesó correctamente.';
    responseCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function updateCount() {
    questionCount.textContent = `${question.value.length} / 2000`;
  }

  function reset() {
    clearErrors();
    responseCard.classList.add('d-none');
    statusTitle.textContent = 'Listo para conversar';
    statusMessage.textContent = 'Completa los campos y envía tu pregunta. La respuesta aparecerá aquí sin recargar la página.';
    updateCount();
  }

  question.addEventListener('input', () => {
    updateCount();
    if (question.getAttribute('aria-invalid') === 'true') {
      question.classList.remove('is-invalid');
      question.removeAttribute('aria-invalid');
      document.querySelector('#pregunta-error').textContent = '';
    }
  });

  return { form, clearButton: document.querySelector('#clear-button'), clearErrors, setBusy, showErrors, showError, showResponse, reset };
}
