const ALLOWED_TOPICS = new Set([
  'Inteligencia artificial',
  'Redes',
  'Programación',
  'Bases de datos',
  'Internet de las cosas (IoT)',
]);
const ALLOWED_LEVELS = new Set(['Básico', 'Intermedio', 'Avanzado']);
const ALLOWED_INTEGRATIONS = new Set(['nativo', 'http']);
const MAX_QUESTION_LENGTH = 2000;

export function normalizeQuestion(value) {
  return value
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\r?\n */g, '\n')
    .trim();
}

export function validateForm(values) {
  const question = normalizeQuestion(values.pregunta ?? '');
  const errors = {};

  if (!ALLOWED_TOPICS.has(values.tema)) errors.tema = 'Selecciona un tema de la lista.';
  if (!ALLOWED_LEVELS.has(values.nivel)) errors.nivel = 'Selecciona un nivel de la lista.';
  if (!ALLOWED_INTEGRATIONS.has(values.integracion)) errors.integracion = 'Selecciona un método de integración válido.';
  if (!question) errors.pregunta = 'Escribe tu pregunta.';
  else if (question.length > MAX_QUESTION_LENGTH) errors.pregunta = `La pregunta no puede superar ${MAX_QUESTION_LENGTH} caracteres.`;

  return {
    errors,
    data: { tema: values.tema, nivel: values.nivel, pregunta: question, integracion: values.integracion },
  };
}
