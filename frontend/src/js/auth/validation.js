export function validateAuth({ name = '', email = '', password = '' }, mode) {
  const errors = {};
  if (mode === 'register' && !name.trim()) errors.name = 'Informe como podemos chamar você.';

  if (!email.trim()) errors.email = 'Informe seu e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Confira o e-mail. Exemplo: voce@email.com.';
  }

  if (!password.trim()) errors.password = 'Informe sua senha.';
  else if (mode === 'register' && [...password].length < 12) {
    errors.password = 'Use pelo menos 12 caracteres na sua senha.';
  } else if (mode === 'register' && [...password].length > 128) {
    errors.password = 'Use no máximo 128 caracteres na sua senha.';
  }
  return errors;
}
