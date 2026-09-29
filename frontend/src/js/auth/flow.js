export function destinationAfterAuth(mode, profile) {
  return mode === 'login' && profile?.answers ? '/treino.html' : '/questionario.html';
}
