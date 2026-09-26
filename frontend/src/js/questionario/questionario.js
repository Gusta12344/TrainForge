import { createIcons, Activity, Dumbbell, Weight, Volleyball, Check, ArrowRight, ArrowLeft, ChevronDown, Pencil, Plus, Trash2, Info, CircleAlert } from 'lucide';
import { steps, questions, initialAnswers, stepQuestions, validateStep, toggleMultiple, parseNumber, selectedDays } from './model.js';
import { blocks, heading, renderReview, esc } from './render.js';
import { reconcile } from './dom.js';
import { initMotion, entrance, outgoing, enterStep, captureLayout, rearrange, animate, fadeOut, withMotionFocus } from './motion.js';
const icons={Activity,Dumbbell,Weight,Volleyball,Check,ArrowRight,ArrowLeft,ChevronDown,Pencil,Plus,Trash2,Info,CircleAlert};
const refreshIcons=(root=document)=>createIcons({root,icons,attrs:{'stroke-width':1.7,'aria-hidden':'true'}});
const answers=initialAnswers();
const visited=new Set([0]), completed=new Set(), positions=new Map();
const form=document.querySelector('#questionnaire-form');
const content=document.querySelector('#step-content');
const next=document.querySelector('#continue');
const back=document.querySelector('#back');
const status=document.querySelector('#questionnaire-status');
let step=0, editing=null, errors={}, attempted=false, dirty=false, removed=null;
let blockCache=new Map();
const announce=text=>{status.textContent=text;};
const focusId=id=>document.getElementById(id)?.focus({preventScroll:true});
function focusVisible(el) {
 if(!el) return;
 withMotionFocus(() => el.focus({preventScroll:true}));
 const r=el.getBoundingClientRect();
 if(r.top<12 || r.bottom>innerHeight-16) el.scrollIntoView({block:'center',behavior:'instant'});
}
function refreshNavigation() {
 const links=steps.map((name,i)=>{
  const done=completed.has(i)&&!Object.keys(validateStep(answers,i)).length;
  const invalid=completed.has(i)&&!done;
  return `<li ${i===step?'aria-current="step"':''} class="${done?'is-complete':''}">${visited.has(i)?`<button type="button" class="step-link" data-go="${i}" ${i===step?'aria-current="step"':''}>`:'<span class="step-link">'}<span class="step-number">${done&&i!==step?'<i data-lucide="check" aria-hidden="true"></i>':String(i+1).padStart(2,'0')}</span><span>${name}${invalid?'<small>Precisa de revisão</small>':''}</span>${visited.has(i)?'</button>':'</span>'}</li>`;
 }).join('');
 document.querySelectorAll('[data-step-nav]').forEach(nav=>{nav.innerHTML=`<ol>${links}</ol>`;});
 document.querySelector('#step-position').textContent=`Etapa ${step+1} de 7${innerWidth<900?' · '+steps[step]:''}`;
 document.querySelector('.progress-track').innerHTML=steps.map((_,i)=>`<span class="progress-segment ${i===step?'is-current':completed.has(i)&&!Object.keys(validateStep(answers,i)).length?'is-done':''}"></span>`).join('');
 back.hidden=step===0;
 next.disabled=step===6;
 next.innerHTML=`${step===6?'Confirmar respostas e gerar programa':editing!==null?'Voltar à revisão':'Continuar'} <i data-lucide="arrow-right" aria-hidden="true"></i>`;
 document.querySelector('#next-description').textContent=step===6?'Geração de programas indisponível':editing!==null?'Confira suas alterações.':`Próxima etapa: ${steps[step+1]}`;
 refreshIcons();
}
function mount() {
 blockCache=new Map();
 content.innerHTML=heading(step)+'<div id="error-summary" class="error-summary" tabindex="-1" hidden></div><div class="step-body" id="step-body"></div>';
 if(step===6) document.querySelector('#step-body').innerHTML=renderReview(answers);
 else patchBlocks();
 refreshNavigation();
}
function patchBlocks() {
 const body=document.querySelector('#step-body');
 const before=captureLayout(body);
 const focused=document.activeElement;
 const focus={id:focused?.id,start:focused?.selectionStart,end:focused?.selectionEnd,top:focused?.getBoundingClientRect().top};
 const spec=blocks(step,answers);
 const ids=new Set(spec.map(b=>b.id));
 for(const child of [...body.children]) if(!ids.has(child.dataset.block)) { fadeOut(child); child.remove(); blockCache.delete(child.dataset.block); }
 for(const [index,block] of spec.entries()) {
  let node=document.getElementById(`group-${block.id}`);
  if(blockCache.get(block.id)!==block.html) {
   const template=document.createElement('template'); template.innerHTML=block.html;
   refreshIcons(template.content);
   const replacement=template.content.firstElementChild;
   if(node) reconcile(node,replacement); else {
    body.insertBefore(replacement,body.children[index]??null);
    node=replacement;
   } blockCache.set(block.id,block.html);
  }
 }
 if(focus.id && document.getElementById(focus.id)) {
  if(document.activeElement.id !== focus.id) focusId(focus.id);
  const field=document.getElementById(focus.id);
  if(focus.start!=null && field.setSelectionRange) {try{field.setSelectionRange(focus.start,focus.end);}catch{/* Native date fields have no text selection. */}}
 }
 refreshIcons();
 if(attempted) { errors=validateStep(answers,step); paintErrors(false); }
 rearrange(body,before,document.getElementById(focus.id),focus.top);
 if(before.blockCount && before.blockCount!==spec.length) announce('As perguntas foram atualizadas conforme suas respostas. Os rascunhos anteriores continuam nesta página.');
}
function paintErrors(moveFocus) {
 const body=document.querySelector('#step-body');
 const positionsBefore=captureLayout(body);
 const anchor=document.activeElement;
 const anchorTop=anchor?.getBoundingClientRect().top;
 for(const q of stepQuestions[step]??[]) {
  const group=document.getElementById(`group-${q}`); if(!group) continue;
  const message=document.getElementById(`error-${q}`);
  const wasHidden=message.hidden;
  if(!errors[q]&&!wasHidden) fadeOut(message);
  message.textContent=errors[q]?`Atenção: ${errors[q]}`:'';
  message.hidden=!errors[q];
  group.querySelectorAll('input,select,textarea').forEach(input=>{
   input.setAttribute('aria-invalid',String(Boolean(errors[q])));
   if(errors[q]) input.setAttribute('aria-describedby',`error-${q}`); else input.removeAttribute('aria-describedby');
  });
  if(errors[q]&&wasHidden) animate(message,[{opacity:0},{opacity:1}],140);
 }
 const summary=document.querySelector('#error-summary');
 const entries=Object.entries(errors);
 summary.hidden=entries.length<2;
 if(entries.length>=2) summary.innerHTML=`<h2>Revise ${entries.length} respostas</h2><ul>${entries.map(([q,message])=>`<li><a href="#group-${q}" data-error-link="${q}">${esc(questions[q])} ${esc(message)}</a></li>`).join('')}</ul>`;
 if(moveFocus&&entries.length) focusVisible(entries.length>1?summary:document.querySelector(`#group-${entries[0][0]} input, #group-${entries[0][0]} select, #group-${entries[0][0]} button`));
 if(!moveFocus) rearrange(body,positionsBefore,anchor,anchorTop);
}
function remember() {
 positions.set(step,{scroll:scrollY,focus:document.activeElement?.id});
}
function go(destination,{edit=false,returnToReview=false,history=true}={}) {
 // A revisão exige dados coerentes também quando acessada pelo histórico do navegador.
 if(destination===6) {
  const incomplete=[0,1,2,3,4,5].find(i=>Object.keys(validateStep(answers,i)).length);
  if(incomplete!==undefined) {
   go(incomplete,{history});attempted=true;errors=validateStep(answers,incomplete);paintErrors(true);
   announce(`Confira ${steps[incomplete].toLowerCase()} antes de retornar à revisão.`);return;
  }
 }
 if(destination===step) return;
 remember();
 const previous=step;
 outgoing(content,destination>step?1:-1);
 step=destination; visited.add(step); attempted=false; errors={};
 mount();
 document.querySelector('#mobile-steps').hidden=true;
 document.querySelector('#show-steps').setAttribute('aria-expanded','false');
 if(history) window.history.pushState({questionnaire:true,step},'',location.pathname);
 const saved=positions.get(step);
 if(returnToReview) {
  const target=document.getElementById(`edit-${editing}`);
  window.scrollTo(0,saved?.scroll??0); focusVisible(target);
  const updated=document.createElement('p');updated.className='review-updated';updated.textContent='Atualizado nesta revisão';
  target.closest('.review-section').append(updated);
  animate(updated,[{opacity:.6},{opacity:1}],700);
  editing=null;
  announce('Respostas atualizadas nesta revisão.');
 } else if(destination<previous && !edit && saved) {
  window.scrollTo(0,saved.scroll); focusVisible(document.getElementById(saved.focus)||document.querySelector('#step-title'));
 } else {
  window.scrollTo(0,0); focusVisible(document.querySelector('#step-title'));
 }
 enterStep(content,destination>previous?1:-1,step===6);
}
function setAnswer(name,value) {
 const keys=name.split('.');
 if(['sportEvents','otherEvents'].includes(keys[0])) {
  const event=answers[keys[0]].find(e=>e.id===keys[1]); if(event) event[keys[2]]=value;
 } else if(keys.length===2) answers[keys[0]][keys[1]]=value;
 else answers[name]=value;
 dirty=true;
}
function readAnswer(name) {
 const keys=name.split('.');
 return keys.length===3?answers[keys[0]].find(e=>e.id===keys[1])?.[keys[2]]:keys.length===2?answers[keys[0]][keys[1]]:answers[name];
}
form.addEventListener('input',event=>{
 const input=event.target;
 if(input.matches('input:not([type=radio]):not([type=checkbox]),textarea')) setAnswer(input.name,input.value);
});
form.addEventListener('change',event=>{
 const input=event.target;
 if(!input.name) return;
 if(input.type==='checkbox') {
  if(input.hasAttribute('data-multiple')) {
   const value=toggleMultiple(readAnswer(input.name),input.value,(input.dataset.exclusive??'').split('|'));
   if(input.name==='Q04'&&value.length>2) {
    input.checked=false;
    const message='Escolha até duas regiões. Desmarque uma antes de selecionar outra.';
    document.getElementById('error-Q04').textContent=message;
    document.getElementById('error-Q04').hidden=false;
    announce(message);return;
   }
   setAnswer(input.name,value);
  } else setAnswer(input.name,input.checked);
 } else setAnswer(input.name,input.value);
 if(input.matches('select,input[type=radio],input[type=checkbox]') || input.name==='otherSport') patchBlocks();
 else if(attempted) {errors=validateStep(answers,step);paintErrors(false);}
 refreshNavigation();
});
form.addEventListener('focusout',event=>{
 if(attempted&&event.target.matches('input,select')) {errors=validateStep(answers,step);paintErrors(false);}
});
form.addEventListener('focusin',event=>{
 if(!event.target.matches('input:focus-visible,select:focus-visible,textarea:focus-visible')) return;
 const control=event.target.closest('.choice,.text-field')||event.target;
 const rect=control.getBoundingClientRect();
 if(rect.bottom>innerHeight-12 || rect.top<12) control.scrollIntoView({block:'center',behavior:'instant'});
});
form.addEventListener('keydown',event=>{
 if(event.repeat && ['Enter',' '].includes(event.key) && event.target.closest('button')) event.preventDefault();
 if(event.key==='Enter' && event.target.matches('input')) event.preventDefault();
});
// Native double-click events must not advance the newly rendered step a second time.
next.addEventListener('click',event=>{if(event.detail>1) event.preventDefault();});
form.addEventListener('submit',event=>{
 event.preventDefault();
 if(step===6) return; // There is deliberately no network adapter until a real contract exists.
 attempted=true; errors=validateStep(answers,step); paintErrors(true);
 if(Object.keys(errors).length) return;
 completed.add(step);
 if(editing!==null || step===5) {
  const incomplete=[0,1,2,3,4,5].find(i=>Object.keys(validateStep(answers,i)).length);
  if(incomplete!==undefined) {go(incomplete);attempted=true;errors=validateStep(answers,step);paintErrors(true);announce(`Confira ${steps[step].toLowerCase()} antes de retornar à revisão.`);return;}
  go(6,{returnToReview:editing!==null});
 } else go(step+1);
});
back.addEventListener('click',event=>{if(event.detail<=1) go(step-1);});
document.addEventListener('click',event=>{
 const link=event.target.closest('[data-go],[data-edit],[data-add],[data-remove],[data-error-link],[data-apply-time],[data-undo]');
 if(!link || event.detail>1) return;
 if(link.hasAttribute('data-go')) {
  const target=Number(link.dataset.go);
  if(!visited.has(target)) return;
  const invalid=target===6?[0,1,2,3,4,5].find(i=>Object.keys(validateStep(answers,i)).length):undefined;
  if(invalid!==undefined) {
   go(invalid);attempted=true;errors=validateStep(answers,step);paintErrors(true);
   announce(`Confira ${steps[step].toLowerCase()} antes de retornar à revisão.`);
  } else go(target);
  return;
 }
 if(link.hasAttribute('data-edit')) {editing=Number(link.dataset.edit);go(editing,{edit:true});return;}
 if(link.hasAttribute('data-error-link')) {event.preventDefault();focusVisible(document.querySelector(`#group-${link.dataset.errorLink} input, #group-${link.dataset.errorLink} select, #group-${link.dataset.errorLink} button`));return;}
 if(link.hasAttribute('data-apply-time')) {
  if(!(parseNumber(answers.commonTime)>0)) {announce('Informe um tempo maior que zero antes de aplicar.');focusVisible(document.getElementById('commonTime'));return;}
  selectedDays(answers).forEach(d=>{answers.times[d]=answers.commonTime;}); dirty=true;patchBlocks();announce('Tempo aplicado aos dias selecionados.');return;
 }
 if(link.dataset.add) {
  const kind=link.dataset.add;
  const id=crypto.randomUUID(); answers[kind].push({id,days:[]}); removed=null;dirty=true;
  patchBlocks();document.querySelector('[data-undo]')?.remove();
  focusVisible(document.querySelector(`[data-event="${id}"] input, [data-event="${id}"] select`));return;
 }
 if(link.dataset.remove) {
  const kind=link.dataset.remove,index=answers[kind].findIndex(e=>e.id===link.dataset.id);
  if(index<0) return;
  removed={kind,index,event:answers[kind][index]};answers[kind].splice(index,1);dirty=true;patchBlocks();
  const add=document.querySelector(`[data-add="${kind}"]`);
  document.querySelector('[data-undo]')?.remove();
  add.insertAdjacentHTML('afterend','<button class="text-button undo-button" type="button" data-undo>Desfazer remoção</button>');
  focusVisible(add);announce('Atividade removida. Você pode desfazer.');return;
 }
 if(link.hasAttribute('data-undo')&&removed) {
  const {kind,index,event:removedEvent}=removed;answers[kind].splice(index,0,removedEvent);removed=null;patchBlocks();
  focusVisible(document.querySelector(`[data-event="${removedEvent.id}"] input, [data-event="${removedEvent.id}"] select`));announce('Atividade restaurada.');
 }
});
const showSteps=document.querySelector('#show-steps');
showSteps.hidden=false;
showSteps.addEventListener('click',()=>{
 const nav=document.querySelector('#mobile-steps');nav.hidden=!nav.hidden;showSteps.setAttribute('aria-expanded',String(!nav.hidden));
 if(!nav.hidden) animate(nav,[{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],180);
});
window.history.replaceState({questionnaire:true,step:0},'',location.pathname);
window.addEventListener('popstate',event=>{
 if(event.state?.questionnaire && visited.has(event.state.step)) go(event.state.step,{history:false});
});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
initMotion(); mount();
document.querySelector('#questionnaire-actions').hidden=false;
window.addEventListener('resize',()=>{document.querySelector('#step-position').textContent=`Etapa ${step+1} de 7${innerWidth<900?' · '+steps[step]:''}`;});
entrance();
