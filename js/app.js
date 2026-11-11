import { askAssistant, ApiError } from './api.js';
import { validateForm } from './validation.js';
import { createUI } from './ui.js';

const ui = createUI();
let requestActive = false;

function readForm() {
  return Object.fromEntries(new FormData(ui.form).entries());
}

ui.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (requestActive) return;

  ui.clearErrors();
  const { errors, data } = validateForm(readForm());
  if (Object.keys(errors).length) {
    ui.showErrors(errors);
    return;
  }

  requestActive = true;
  ui.setBusy(true);
  try {
    const result = await askAssistant(data);
    ui.showResponse(result, data);
  } catch (error) {
    const message = error instanceof ApiError
      ? error.message
      : 'Ocurrió un error inesperado. Inténtalo manualmente otra vez.';
    ui.showError(message);
  } finally {
    requestActive = false;
    ui.setBusy(false);
  }
});

ui.form.addEventListener('reset', (event) => {
  if (requestActive) {
    event.preventDefault();
    return;
  }
  window.setTimeout(() => ui.reset(), 0);
});
