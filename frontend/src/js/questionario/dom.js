// Atualiza somente o que mudou, preservando inputs, foco e transições de seleção.
// O HTML recebido já é produzido pelos templates escapados do próprio fluxo.
function key(node) {
 if (node.nodeType !== Node.ELEMENT_NODE) return null;
 return node.id || node.dataset.event || node.dataset.motionKey || node.getAttribute('for');
}
export function reconcile(current, next) {
 if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) {
  current.replaceWith(next);
  return;
 }
 if (current.nodeType === Node.TEXT_NODE) {
  if (current.data !== next.data) current.data = next.data;
  return;
 }
 if (current.nodeType !== Node.ELEMENT_NODE) return;
 for (const attribute of [...current.attributes]) {
  // Animações em execução administram seus próprios estilos transitórios.
  if (attribute.name === 'style' || attribute.name === 'data-motion-active') continue;
  if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
 }
 for (const attribute of next.attributes) {
  if (current.getAttribute(attribute.name) !== attribute.value) current.setAttribute(attribute.name, attribute.value);
 }
 // Propriedades dirty dos controles não acompanham automaticamente seus atributos.
 if (current instanceof HTMLInputElement) {
  current.checked = next.checked;
  if (current.value !== next.value) current.value = next.value;
 }
 const selectedValue = next instanceof HTMLSelectElement ? next.value : null;
 const expected = [...next.childNodes];
 let cursor = current.firstChild;
 for (const child of expected) {
  const childKey = key(child);
  let match = childKey ? [...current.childNodes].find(node => key(node) === childKey) : cursor;
  if (match && (key(match) !== childKey || match.nodeName !== child.nodeName)) match = null;
  if (match) {
   if (match !== cursor) current.insertBefore(match, cursor);
   reconcile(match, child);
   cursor = match.nextSibling;
  } else {
   current.insertBefore(child, cursor);
  }
 }
 while (cursor) { const after = cursor.nextSibling; cursor.remove(); cursor = after; }
 if (current instanceof HTMLSelectElement && current.value !== selectedValue) current.value = selectedValue;
}
