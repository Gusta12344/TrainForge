const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = () => matchMedia('(max-width: 767px)').matches;
const arrival = 'cubic-bezier(.22,1,.36,1)';
const adjustment = 'cubic-bezier(.2,.8,.2,1)';
const running = new Map();
const copies = new Set();
let programmaticFocus = false;
let pointerPress = null;

function cancel(element) {
 const record = running.get(element);
 if (!record) return;
 record.animation.cancel();
 running.delete(element);
 element.removeAttribute('data-motion-active');
}
export function stopMotion() {
 pointerPress = null;
 for (const element of running.keys()) cancel(element);
 for (const copy of copies) copy.remove();
 copies.clear();
}
export function animate(element, frames, duration, delay = 0, easing = arrival, kind = 'feedback') {
 if (!element || reduce.matches || !element.animate || document.hidden) return;
 cancel(element);
 element.setAttribute('data-motion-active', kind);
 // Backwards fill applies the first frame during the brief choreography delay.
 const animation = element.animate(frames, { duration, delay, easing, fill: 'backwards' });
 running.set(element, { animation, kind });
 const clean = () => {
  if (running.get(element)?.animation === animation) {
   running.delete(element);
   element.removeAttribute('data-motion-active');
  }
 };
 animation.finished.then(clean, clean);
 return animation;
}
function titleEntrance(container, duration, delay = 0) {
 container.querySelectorAll('.title-line').forEach((line, index) => {
  if (!line.getBoundingClientRect().height) return;
  animate(line, [
   { transform: 'translateY(105%)', opacity: 0 },
   { transform: 'translateY(0)', opacity: 1 },
  ], duration, delay + index * (mobile() ? 35 : 55), arrival, 'title');
 });
}
export function entrance() {
 animate(document.querySelector('.rail-content'), [
  { opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' },
 ], 400, 0, arrival, 'intro');
 titleEntrance(document.querySelector('#step-content'), mobile() ? 400 : 620, 40);
 document.querySelectorAll('.question').forEach((element, index) => {
  if (index < 4 && element.getBoundingClientRect().top < innerHeight) {
   animate(element, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], mobile() ? 300 : 440, 100 + index * 45, arrival, 'intro');
  }
 });
 animate(document.querySelector('.questionnaire-photo'), [{ opacity: .3 }, { opacity: .88 }], 800, 0, arrival, 'intro');
 animate(document.querySelector('.questionnaire-court'), [{ opacity: 0 }, { opacity: .2 }], 600, 160, arrival, 'intro');
}

function layoutNodes(container) {
 return [...container.querySelectorAll(':scope > [data-block], .follow-up, .event-row, .equipment-group')];
}
function layoutKey(element) {
 if (element.id) return element.id;
 const question = element.closest('[data-block]')?.id;
 return `${question}:${element.dataset.event || element.dataset.motionKey || 'follow-up'}`;
}
export function captureLayout(container) {
 // Capture visual coordinates BEFORE cancelling: interrupted transitions restart here.
 const positions = new Map(layoutNodes(container).map(element => [layoutKey(element), {
  element,
  question: element.closest('[data-block]'),
  rect: element.getBoundingClientRect(),
  opacity: getComputedStyle(element).opacity,
 }]));
 positions.blockCount = container.querySelectorAll(':scope > [data-block]').length;
 positions.tail = ['.session-help', '#questionnaire-actions'].map(selector => document.querySelector(selector))
  .filter(element => element && getComputedStyle(element).position !== 'fixed')
  .map(element => ({ element, rect: element.getBoundingClientRect() }));
 for (const [element, record] of running) {
  if (record.kind === 'layout' || record.kind === 'reveal') cancel(element);
 }
 return positions;
}
function inertCopy(element, rect, fixed = false) {
 const copy = element.cloneNode(true);
 copy.removeAttribute('id');
 copy.removeAttribute('data-motion-active');
 copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
 copy.querySelectorAll('[data-motion-active]').forEach(node => node.removeAttribute('data-motion-active'));
 copy.querySelectorAll('input,button,select,textarea').forEach(node => { node.disabled = true; node.removeAttribute('name'); });
 copy.inert = true;
 copy.setAttribute('aria-hidden', 'true');
 copy.classList.add('step-ghost');
 // Cloning alone loses WAAPI presentation styles. Freeze the currently visible frame.
 const sources = [element, ...element.querySelectorAll('*')];
 const targets = [copy, ...copy.querySelectorAll('*')];
 sources.forEach((source, index) => {
  if (!running.has(source)) return;
  const style = getComputedStyle(source);
  Object.assign(targets[index].style, { transform: style.transform, opacity: style.opacity, clipPath: style.clipPath });
 });
 Object.assign(copy.style, {
  position: fixed ? 'fixed' : 'absolute',
  top: `${rect.top + (fixed ? 0 : scrollY)}px`,
  left: `${rect.left + (fixed ? 0 : scrollX)}px`,
  width: `${rect.width}px`,
  margin: '0',
 });
 document.body.append(copy);
 copies.add(copy);
 return copy;
}
function releaseCopy(copy, animation) {
 const clean = () => { copy.remove(); copies.delete(copy); };
 if (animation) animation.finished.then(clean, clean); else clean();
}
export function fadeOut(element, rect = element?.getBoundingClientRect()) {
 if (reduce.matches || !element || element.hidden || !rect?.height || rect.bottom < 0 || rect.top > innerHeight) return;
 const copy = inertCopy(element, rect);
 releaseCopy(copy, animate(copy, [
  { opacity: .8, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' },
 ], mobile() ? 140 : 180, 0, 'cubic-bezier(.4,0,1,1)', 'exit'));
}
export function rearrange(container, before, anchor, anchorTop) {
 if (!before.size) return; // The page/step entrance owns the first presentation.
 const keyboard = window.visualViewport && window.visualViewport.height < innerHeight * .75;
 if (anchor?.isConnected && Number.isFinite(anchorTop)) {
  const offset = anchor.getBoundingClientRect().top - anchorTop;
  if (Math.abs(offset) > 1) window.scrollBy(0, offset);
 }
 if (keyboard || reduce.matches) return;
 const duration = mobile() ? 300 : 420;
 const nodes = layoutNodes(container);
 const rects = new Map(nodes.map(element => [layoutKey(element), element.getBoundingClientRect()]));
 for (const element of nodes) {
  const key = layoutKey(element), old = before.get(key), rect = rects.get(key);
  const question = element.closest('[data-block]');
  const questionOld = before.get(question?.id), questionRect = rects.get(question?.id);
  if (rect.top > innerHeight + 120 || rect.bottom < -120) continue;
  if (!old) {
   // One reveal per new question. Nested elements inherit it, avoiding compounded motion.
   if (element !== question && !questionOld) continue;
   const disclosure = element.parentElement.closest('.follow-up, .equipment-group');
   if (disclosure && !before.has(layoutKey(disclosure))) continue;
   animate(element, [
    { opacity: 0, transform: 'translateY(-6px)' },
    { opacity: 1, transform: 'none' },
   ], duration, 0, adjustment, 'reveal');
  } else {
   const parentDelta = element !== question && questionOld && questionRect ? questionOld.rect.top - questionRect.top : 0;
   const delta = old.rect.top - rect.top - parentDelta;
   if (Math.abs(delta) > .5 && !element.contains(document.activeElement)) {
    // Full FLIP offset, including large disclosures: no instant 24px cutoff.
    animate(element, [{ transform: `translateY(${delta}px)`, opacity: old.opacity }, { transform: 'none', opacity: 1 }], duration, 0, adjustment, 'layout');
   } else if (Number(old.opacity) < .99) {
    animate(element, [{ opacity: old.opacity }, { opacity: 1 }], duration, 0, adjustment, 'layout');
   }
  }
 }
 for (const old of before.values()) {
  // Top-level removals are handled before detaching; nested disclosures need their own exit.
  if (!old.element.isConnected && old.element !== old.question && old.question?.isConnected) fadeOut(old.element, old.rect);
 }
 for (const { element, rect } of before.tail ?? []) {
  const delta = rect.top - element.getBoundingClientRect().top;
  if (Math.abs(delta) > .5 && !element.contains(document.activeElement)) {
   animate(element, [{ transform: `translateY(${delta}px)` }, { transform: 'none' }], duration, 0, adjustment, 'layout');
  }
 }
}
export function outgoing(container, direction) {
 // The previous representation stays in viewport coordinates while navigation restores scroll.
 const rect = container.getBoundingClientRect();
 const visibleCopy = !reduce.matches ? inertCopy(container, rect, true) : null;
 stopMotion();
 if (!visibleCopy) return;
 // stopMotion also clears copies: reattach this new, already captured representation.
 document.body.append(visibleCopy); copies.add(visibleCopy);
 releaseCopy(visibleCopy, animate(visibleCopy, [
  { opacity: .85, transform: 'none' },
  { opacity: 0, transform: `translateX(${direction * (mobile() ? -20 : -36)}px)` },
 ], mobile() ? 160 : 200, 0, 'cubic-bezier(.4,0,1,1)', 'stage-exit'));
}
export function enterStep(container, direction, review = false) {
 const duration = mobile() ? 340 : review ? 440 : 500;
 titleEntrance(container, duration, 30);
 animate(container.querySelector('.step-heading p'), [
  { opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' },
 ], mobile() ? 260 : 360, 70, arrival, 'stage');
 let index = 0;
 for (const element of container.querySelector('.step-body').children) {
  const rect = element.getBoundingClientRect();
  if (rect.top > innerHeight || rect.bottom < 0) continue;
  // A focused field stays stationary; its siblings can still complete the transition.
  if (element.contains(document.activeElement)) continue;
  animate(element, [
   { opacity: 0, transform: `translateX(${direction * (mobile() ? 20 : 36)}px)` },
   { opacity: 1, transform: 'none' },
  ], mobile() ? 300 : 420, 65 + Math.min(index++, 3) * 40, arrival, 'stage');
 }
 animate(document.querySelector('.progress-segment.is-current'), [
  { transform: 'scaleX(.08)', opacity: .3 }, { transform: 'scaleX(1)', opacity: 1 },
 ], mobile() ? 300 : 440, 0, adjustment, 'progress');
}
function settleTarget(target) {
 if (!(target instanceof Element)) return;
 // Do not cancel unrelated layout transitions on every click, wheel or navigation press.
 for (const [element, record] of running) {
  if (record.kind === 'intro' || element.contains(target) || target.contains(element) && target.matches('input,select,textarea')) cancel(element);
 }
}
export function withMotionFocus(callback) {
 programmaticFocus = true;
 try {
  callback();
  if (document.activeElement?.matches('input,select,textarea')) settleTarget(document.activeElement);
 } finally { programmaticFocus = false; }
}
export function initMotion() {
 // Freeze the hit target through pointerup/click. Cancelling on pointerdown jumps
 // to the final layout before the click and can lose a selection during a reveal.
 document.addEventListener('pointerdown', event => {
  if (!(event.target instanceof Element)) return;
  for (const [element, record] of pointerPress?.records ?? []) if (running.get(element) === record) cancel(element);
  const press = { records: [] };
  pointerPress = press;
  for (const [element, record] of running) {
   if (element.contains(event.target)) { record.animation.pause(); press.records.push([element, record]); }
  }
 }, { capture: true });
 const finishPress = () => {
  const press = pointerPress;
  requestAnimationFrame(() => {
   if (pointerPress !== press) return;
   pointerPress = null;
   for (const [element, record] of press?.records ?? []) if (running.get(element) === record) cancel(element);
  });
 };
 document.addEventListener('pointerup', finishPress, { capture: true });
 document.addEventListener('pointercancel', finishPress, { capture: true });
 document.addEventListener('keydown', event => {
  if (event.key === 'Tab') stopMotion();
  else if (event.target.matches('input,select,textarea')) settleTarget(event.target);
 }, { capture: true });
 document.addEventListener('focusin', event => { if (!programmaticFocus && !pointerPress) settleTarget(event.target); });
 reduce.addEventListener('change', stopMotion);
 document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); });
 let width = innerWidth;
 window.addEventListener('resize', () => { if (Math.abs(innerWidth - width) > 1) { stopMotion(); width = innerWidth; } });
}
