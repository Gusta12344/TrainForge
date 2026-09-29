import { createIcons,Menu,X,Dumbbell,UserRound,LogOut,ChevronLeft,ChevronRight,ChevronDown,ArrowRight,Check,Moon,Play,ExternalLink,Layers,Repeat2,Clock3,RotateCcw,CircleCheck,CirclePause } from 'lucide';
import { WorkoutRepository,STORAGE_KEY } from './repository.js';
import { localDateKey,weekDates,shiftLocalDate,sessionForDate,formatDate } from './calendar.js';
import { createExecution,completeSet,skipWarmup,undoSet,updateSet,completeExercise,finishExecution,parseLoad,parseReps,setReference } from './model.js';
import { startRest,remainingSeconds,extendRest,endRest } from './rest.js';
import { renderWeek,renderSession,renderExerciseDetail,renderCompletedSetActions,renderRest } from './render.js';
import { entrance,contextEntrance,exerciseReveal,exerciseHide,sidebarFlip,cancelMotion,animate,checkFeedback } from './motion.js';
const icons={Menu,X,Dumbbell,UserRound,LogOut,ChevronLeft,ChevronRight,ChevronDown,ArrowRight,Check,Moon,Play,ExternalLink,Layers,Repeat2,Clock3,RotateCcw,CircleCheck,CirclePause};
const iconize=(root=document)=>createIcons({root,icons,attrs:{'stroke-width':1.7,'aria-hidden':'true'}});
const repo=new WorkoutRepository(),result=repo.load();
const state={data:result.data,selectedDate:localDateKey(new Date()),weekStart:weekDates(new Date())[0],openExerciseIds:new Set(),saveTimer:null,drafts:new Map(),stale:false,drawer:false,lastToday:localDateKey(new Date())};
const $=selector=>document.querySelector(selector);
const announce=message=>{$('#announcement').textContent=message;};
function status(message,error=false){$('#save-status').textContent=message;$('#retry-save').hidden=!error;}
function persist(){
 if(state.stale){status('Outra aba alterou estes dados. Recarregue antes de continuar.',true);return false;}
 status('Salvando');const saved=repo.save(state.data);status(saved.ok?'Salvo neste navegador':saved.error,!saved.ok);return saved.ok;
}
function currentSession(){return sessionForDate(state.data.program,state.selectedDate);}
function currentRun(){const session=currentSession();return session?state.data.executions.find(e=>e.plannedDate===state.selectedDate&&e.sessionTemplateId===session.id)||null:null;}
function activeRun(){return state.data.executions.find(e=>e.status==='active')||null;}
function replaceRun(next){const index=state.data.executions.findIndex(e=>e.id===next.id);if(index>=0)state.data.executions[index]=next;else state.data.executions.push(next);}
function renderAll({first=false,kind='session',direction=1,animateContext=true}={}){
 if(!state.data)return;
 const today=localDateKey(new Date());state.lastToday=today;
 $('#week-title').textContent=`${formatDate(state.weekStart,{day:'numeric',month:'short'})} — ${formatDate(shiftLocalDate(state.weekStart,6),{day:'numeric',month:'short',year:'numeric'})}`;
 $('#week-grid').innerHTML=renderWeek(state.data,state.weekStart,state.selectedDate,today);
 const session=currentSession(),available=new Set(session?.exercises.map(ex=>ex.id)||[]);
 for(const id of state.openExerciseIds)if(!available.has(id))state.openExerciseIds.delete(id);
 $('#session-view').innerHTML=renderSession(state.data,state.selectedDate,today,state.openExerciseIds);
 const active=activeRun(),banner=$('#active-banner');
 if(state.stale){banner.hidden=false;banner.innerHTML='<p>Os dados mudaram em outra aba. Recarregue antes de registrar mais séries.</p><button type="button" class="secondary-action" id="reload-data">Recarregar</button>';}
 else if(active&&active.plannedDate!==state.selectedDate){banner.hidden=false;banner.innerHTML=`<p>Há um treino em andamento desde ${formatDate(active.performedDate)}.</p><button type="button" class="secondary-action" id="resume-workout">Retomar treino</button>`;}
 else banner.hidden=true;
 iconize();hydrateDrafts();renderTimer();
 if(first)entrance();else if(animateContext)contextEntrance(kind,direction);
}
function exerciseEntry(id){return [...document.querySelectorAll('.exercise-entry')].find(node=>node.dataset.entry===id);}
function hydrateDrafts(onlyEntry){const run=currentRun();if(!run)return;for(const [key,values] of state.drafts){if(!key.startsWith(`${run.id}:`))continue;const [,exerciseId,setId]=key.split(':'),entry=exerciseEntry(exerciseId);if(!entry||(onlyEntry&&entry!==onlyEntry))continue;const row=[...entry.querySelectorAll('[data-set]')].find(node=>node.dataset.set===setId);if(!row)continue;for(const field of ['load','reps'])if(values[field]!==undefined)row.querySelector(`[data-field="${field}"]`).value=values[field];}}
function clearDraftsForExercise(runId,exerciseId){for(const key of state.drafts.keys())if(key.startsWith(`${runId}:${exerciseId}:`))state.drafts.delete(key);}
function renderTimer(){const rest=activeRun()?.rest,panel=$('#rest-panel');if(!rest||rest.status!=='active'){panel.hidden=true;document.body.classList.remove('has-rest');return;}
 const run=activeRun(),ex=run.prescriptionSnapshot.exercises.find(e=>e.id===rest.exerciseId),remaining=remainingSeconds(rest,new Date());
 if(panel.hidden||panel.dataset.restId!==`${rest.executionId}:${rest.startedAt}`){panel.innerHTML=renderRest(rest,remaining,ex?.name||'Série');panel.dataset.restId=`${rest.executionId}:${rest.startedAt}`;panel.hidden=false;document.body.classList.add('has-rest');iconize(panel);animate(panel,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],240,200);announce(`Descanso iniciado após ${ex?.name||'a série'}.`);}
 else {const clock=$('#rest-clock'),text=$('#rest-message'),bar=$('#rest-progress');clock.textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;bar.style.width=`${Math.min(100,remaining/(rest.suggestedSeconds+rest.extensionSeconds)*100)}%`;if(!remaining&&text.dataset.done!=='true'){text.textContent='Tempo sugerido concluído. Continue quando estiver pronto.';text.dataset.done='true';announce(text.textContent);}}
}
function flushDrafts(){clearTimeout(state.saveTimer);if(state.stale)return;const run=currentRun();if(!run||run.status!=='active')return;
 let next=run,changed=false;
 for(const [key,values] of state.drafts){if(!key.startsWith(`${run.id}:`))continue;const [,exerciseId,setId]=key.split(':');const set=next.exercises.find(e=>e.id===exerciseId)?.sets.find(s=>s.id===setId);if(!set||set.status!=='pending')continue;
  let load=set.actualLoadKg,reps=set.actualReps;
  try{if(values.load!==undefined)load=parseLoad(values.load);}catch{/* Keep last valid value. */}
  try{if(values.reps!==undefined)reps=parseReps(values.reps);}catch{/* Keep last valid value. */}
  if(load!==set.actualLoadKg||reps!==set.actualReps){next=updateSet(next,exerciseId,setId,load,reps);changed=true;}
 }
 if(changed){replaceRun(next);persist();}
}
function chooseDate(date){flushDrafts();const previous=state.selectedDate;state.selectedDate=date;state.weekStart=weekDates(date)[0];state.openExerciseIds.clear();renderAll({kind:'session',direction:date>previous?1:-1});announce(`${formatDate(date)} selecionado.`);}
function chooseExercise(id){
 const session=currentSession(),entry=exerciseEntry(id);if(!session||!entry)return;
 flushDrafts();const opening=!state.openExerciseIds.has(id),entryTop=entry.getBoundingClientRect().top;
 const currentDetail=entry.querySelector('.exercise-detail'),resume=opening&&Boolean(currentDetail);
 if(opening)state.openExerciseIds.add(id);else state.openExerciseIds.delete(id);
 const button=entry.querySelector('.exercise-item');button.classList.toggle('selected',opening);button.setAttribute('aria-expanded',String(opening));if(opening)button.setAttribute('aria-controls',`exercise-detail-${id}`);else button.removeAttribute('aria-controls');
 if(opening){
  if(!resume){entry.insertAdjacentHTML('beforeend',renderExerciseDetail(state.data,state.selectedDate,id));iconize(entry);hydrateDrafts(entry);}
  exerciseReveal(entry.querySelector('.exercise-detail'),{resume});
 }else exerciseHide(currentDetail);
 const shift=entry.getBoundingClientRect().top-entryTop;if(Math.abs(shift)>1)window.scrollBy(0,shift);
 announce(opening?`${session.exercises.find(ex=>ex.id===id).name} aberto.`:'Detalhes do exercício fechados.');
}
function startWorkout(){flushDrafts();if(state.stale)return;
 const session=currentSession();if(!session)return;const today=localDateKey(new Date());
 const existing=state.data.executions.find(e=>e.source==='local'&&e.performedDate===today&&e.sessionTemplateId===session.id);
 if(existing){chooseDate(existing.plannedDate);if(existing.status==='active')chooseExercise(session.exercises[0].id);announce(existing.status==='active'?'Treino retomado.':'Registro existente aberto.');return;}
 const active=activeRun();if(active){confirmAction('Já existe um treino em andamento','Retome esse treino ou encerre-o como incompleto antes de iniciar outro.', 'Encerrar e iniciar',()=>{replaceRun(finishExecution(active,new Date(),true));persist();createNewWorkout(session,today);});return;}
 createNewWorkout(session,today);
}
function createNewWorkout(session,today){const next=createExecution(state.data.program,session.id,state.selectedDate,new Date(),state.data.executions,state.data.profile.id);replaceRun(next);persist();const firstId=session.exercises[0].id,firstWasOpen=state.openExerciseIds.has(firstId);state.openExerciseIds.add(firstId);renderAll({animateContext:false});if(!firstWasOpen)exerciseReveal(exerciseEntry(firstId)?.querySelector('.exercise-detail'));announce('Treino iniciado. Primeiro exercício aberto. Registre o aquecimento e as séries realizadas.');}
function confirmAction(title,message,label,action){const dialog=$('#confirm-dialog');$('#confirm-title').textContent=title;$('#confirm-text').textContent=message;$('#confirm-accept').textContent=label;dialog._action=action;dialog.showModal();$('#confirm-cancel').focus();}
function showFieldError(row,message,field){const error=row.querySelector('[data-error]');error.textContent=message;error.hidden=false;if(field){field.setAttribute('aria-invalid','true');field.focus();}announce(message);}
function completeCurrentSet(button){flushDrafts();const run=currentRun();if(!run||run.status!=='active')return;
 const row=button.closest('[data-set]'),entry=button.closest('.exercise-entry'),exerciseId=entry?.dataset.entry,setId=row?.dataset.set,load=row?.querySelector('[data-field="load"]'),reps=row?.querySelector('[data-field="reps"]');if(!row||!exerciseId)return;
 try{const result=completeSet(run,exerciseId,setId,{load:load.value,reps:reps.value},new Date());let next=result.execution;
  if(next.rest?.status==='active')next.rest=endRest(next.rest,new Date());
  next.rest=result.restRequest?startRest(result.restRequest,result.restRequest.seconds,new Date()):null;replaceRun(next);state.drafts.delete(`${run.id}:${exerciseId}:${setId}`);persist();
  row.classList.add('done');load.disabled=true;reps.disabled=true;row.querySelector('.set-actions').innerHTML=renderCompletedSetActions(setId);row.querySelector('[data-error]').hidden=true;iconize(row);checkFeedback(row);entry.querySelector('.reference-load').disabled=true;entry.querySelector('[data-apply-reference]').disabled=true;renderTimer();announce(result.restRequest?'Série concluída e descanso iniciado.':'Última série concluída. Você pode finalizar o exercício.');
 }catch(error){showFieldError(row,error.message,error.message.includes('repeti')?reps:load);}}
function updateSetRow(row){const error=row.querySelector('[data-error]');error.hidden=true;row.querySelectorAll('input').forEach(input=>input.removeAttribute('aria-invalid'));}
function finishExercise(button){flushDrafts();const run=currentRun(),entry=button.closest('.exercise-entry');if(!run||!entry)return;try{replaceRun(completeExercise(run,entry.dataset.entry));persist();renderAll({animateContext:false});announce('Exercício concluído.');}catch(error){const node=entry.querySelector('.detail-error');node.hidden=false;node.textContent=error.message;announce(error.message);node.scrollIntoView({block:'nearest'});}}
function finishWorkout(incomplete=false){flushDrafts();const run=currentRun();if(!run)return;try{replaceRun(finishExecution(run,new Date(),incomplete));persist();renderAll();announce(incomplete?'Treino encerrado como incompleto. Registros preservados.':'Treino concluído.');}catch(error){announce(error.message);}}
function openVideo(button){const session=currentSession(),ex=session?.exercises.find(e=>e.id===button.dataset.play);if(!ex)return;
 const entry=button.closest('.exercise-entry'),frame=entry?.querySelector('.media-frame'),instructions=entry?.querySelector('.media-instructions');if(!frame)return;if(!ex.video.embedUrl||!navigator.onLine){frame.innerHTML='<div class="video-fallback"><p>Vídeo indisponível nesta conexão. Veja as orientações abaixo ou abra a fonte quando estiver online.</p></div>';instructions.open=true;return;}
 const iframe=document.createElement('iframe');iframe.src=ex.video.embedUrl;iframe.title=`Vídeo de ${ex.name}`;iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allow='encrypted-media; picture-in-picture';iframe.allowFullscreen=true;iframe.addEventListener('error',()=>{frame.innerHTML='<div class="video-fallback"><p>Não foi possível carregar o vídeo. Abra a demonstração na fonte ou veja as orientações abaixo.</p></div>';instructions.open=true;});frame.replaceChildren(iframe);animate(iframe,[{opacity:0},{opacity:1}],160,160);
}
function toggleMenu(){if(innerWidth<900){setDrawer(!state.drawer);return;}
 sidebarFlip(()=>document.body.classList.toggle('sidebar-collapsed'));
 state.data.preferences.sidebarCollapsed=document.body.classList.contains('sidebar-collapsed');persist();updateMenuName();}
function updateMenuName(){const collapsed=document.body.classList.contains('sidebar-collapsed');const button=$('.desktop-menu');button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Expandir menu':'Recolher menu');button.title=collapsed?'Expandir menu':'Recolher menu';$('.mobile-menu').setAttribute('aria-expanded',String(state.drawer));$('.mobile-menu').setAttribute('aria-label',state.drawer?'Fechar menu':'Abrir menu');}
function setDrawer(open){if(state.drawer===open)return;state.drawer=open;document.body.classList.toggle('drawer-open',open);$('#drawer-backdrop').hidden=!open;document.body.style.overflow=open?'hidden':'';updateMenuName();
 const sidebar=$('#workout-sidebar');if(open){sidebar.removeAttribute('inert');sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');sidebar.querySelector('.drawer-close').focus();}else{sidebar.removeAttribute('aria-modal');sidebar.removeAttribute('role');$('.mobile-menu').focus();}}
function onClick(event){const target=event.target.closest('button,a');if(!target)return;
 if(event.detail>1&&(target.dataset.complete||target.dataset.skip||target.dataset.undo))return;
 if(state.stale&&(target.dataset.complete||target.dataset.skip||target.dataset.undo||target.hasAttribute('data-complete-exercise')||target.hasAttribute('data-apply-reference')||['start-workout','finish-workout','stop-workout','extend-rest','end-rest','end-rest-text'].includes(target.id))){announce('Os dados mudaram em outra aba. Recarregue antes de registrar mais séries.');return;}
 if(target.matches('[data-menu]'))return toggleMenu();
 if(target.matches('[data-close-drawer]')||target.id==='drawer-backdrop')return setDrawer(false);
 if(target.dataset.date)return chooseDate(target.dataset.date);
 if(target.id==='previous-week'||target.id==='next-week'){flushDrafts();state.weekStart=shiftLocalDate(state.weekStart,target.id==='previous-week'?-7:7);state.selectedDate=state.weekStart;state.openExerciseIds.clear();renderAll({kind:'week',direction:target.id==='next-week'?1:-1});return;}
 if(target.id==='today-button'){chooseDate(localDateKey(new Date()));return;}
 if(target.dataset.exercise)return chooseExercise(target.dataset.exercise);
 if(target.id==='start-workout')return startWorkout();
 if(target.dataset.complete)return completeCurrentSet(target);
 if(target.dataset.skip){flushDrafts();replaceRun(skipWarmup(currentRun(),target.closest('.exercise-entry').dataset.entry,target.dataset.skip));persist();renderAll({animateContext:false});return;}
 if(target.dataset.undo){flushDrafts();replaceRun(undoSet(currentRun(),target.closest('.exercise-entry').dataset.entry,target.dataset.undo));persist();renderAll({animateContext:false});renderTimer();return;}
 if(target.hasAttribute('data-complete-exercise'))return finishExercise(target);
 if(target.id==='finish-workout')return finishWorkout(false);
 if(target.id==='stop-workout')return confirmAction('Encerrar por hoje?','O treino ficará incompleto. As séries registradas serão preservadas.','Encerrar incompleto',()=>finishWorkout(true));
 if(target.id==='resume-workout'){const active=activeRun();if(active)chooseDate(active.plannedDate);return;}
 if(target.id==='reload-data')return location.reload();
 if(target.dataset.play)return openVideo(target);
 if(target.hasAttribute('data-apply-reference')){const entry=target.closest('.exercise-entry'),input=entry.querySelector('.reference-load'),error=entry.querySelector('.reference-error');try{flushDrafts();replaceRun(setReference(currentRun(),entry.dataset.entry,input.value));persist();renderAll({animateContext:false});announce('Sugestão de aquecimento atualizada.');}catch(e){error.hidden=false;error.textContent=e.message;input.focus();}return;}
 if(target.id==='toggle-rest-details'){const panel=$('#rest-panel'),open=panel.classList.toggle('expanded');target.setAttribute('aria-expanded',String(open));target.setAttribute('aria-label',open?'Ocultar ações do descanso':'Mostrar ações do descanso');return;}
 if(target.id==='extend-rest'){const run=activeRun();if(run?.rest){run.rest=extendRest(run.rest,30,new Date());replaceRun(run);persist();renderTimer();$('#rest-message').textContent='+30 s adicionados. Este tempo é uma referência.';}return;}
 if(target.id==='end-rest'||target.id==='end-rest-text'){const run=activeRun();if(run?.rest){run.rest=endRest(run.rest,new Date());replaceRun(run);persist();renderTimer();announce('Descanso encerrado.');}return;}
 if(target.id==='profile-open'||target.id==='profile-chip'){if(state.drawer)setDrawer(false);$('#profile-dialog').showModal();return;}
 if(target.dataset.closeDialog!==undefined){target.closest('dialog').close();return;}
 if(target.id==='confirm-cancel'){$('#confirm-dialog').close();return;}
 if(target.id==='confirm-accept'){const dialog=$('#confirm-dialog'),action=dialog._action;dialog.close();action?.();return;}
 if(target.id==='reset-demo'||target.id==='reset-error')return confirmAction('Restaurar demonstração?','Somente os dados locais de Meu treino serão removidos. Registros que você fez aqui serão perdidos.','Restaurar demonstração',()=>{const restored=repo.resetDemo(new Date());if(!restored.ok){status(restored.error,true);return;}state.data=repo.load().data;state.selectedDate=localDateKey(new Date());state.weekStart=weekDates(new Date())[0];state.openExerciseIds.clear();state.drafts.clear();state.stale=false;$('#load-error').hidden=true;$('#app-shell').hidden=false;renderAll();status('Salvo neste navegador');});
 if(target.id==='retry-save'){if(state.stale)return location.reload();persist();return;}
}
function onInput(event){const input=event.target;if(!input.matches('[data-field]')||state.stale)return;const row=input.closest('[data-set]'),entry=input.closest('.exercise-entry'),run=currentRun();if(!row||!entry||!run)return;const key=`${run.id}:${entry.dataset.entry}:${row.dataset.set}`,old=state.drafts.get(key)||{};old[input.dataset.field]=input.value;state.drafts.set(key,old);updateSetRow(row);status('Salvando');clearTimeout(state.saveTimer);state.saveTimer=setTimeout(flushDrafts,250);}
function onKeydown(event){if(event.key==='Escape'&&state.drawer){event.preventDefault();setDrawer(false);return;}
 if(state.drawer&&event.key==='Tab'){const controls=[...$('#workout-sidebar').querySelectorAll('a,button')].filter(el=>!el.hidden);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
}
function init(){iconize();document.addEventListener('click',onClick);if(!result.ok){$('#load-error').hidden=false;$('#load-error-text').textContent=result.error;return;}
 document.body.classList.toggle('sidebar-collapsed',innerWidth>=900?(state.data.preferences.sidebarCollapsed||innerWidth<1200):false);updateMenuName();$('#app-shell').hidden=false;renderAll({first:true});if(!result.persisted)status(result.error||'Não salvo neste navegador',true);
 document.addEventListener('input',onInput);document.addEventListener('focusout',event=>{if(event.target.matches('[data-field]'))flushDrafts();});document.addEventListener('keydown',onKeydown);
 $('#drawer-backdrop').addEventListener('click',()=>setDrawer(false));
 $('#confirm-dialog').addEventListener('cancel',()=>{$('#confirm-dialog')._action=null;});
 window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){state.stale=true;clearTimeout(state.saveTimer);renderAll();announce('Dados alterados em outra aba. Recarregue antes de continuar.');}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flushDrafts();else{updateToday();renderTimer();}});
 window.addEventListener('pagehide',flushDrafts);
 window.addEventListener('resize',()=>{if(innerWidth>=900&&state.drawer)setDrawer(false);document.body.classList.toggle('keyboard-open',!!window.visualViewport&&window.visualViewport.height<innerHeight*.72&&innerWidth<900);});
 window.visualViewport?.addEventListener('resize',()=>document.body.classList.toggle('keyboard-open',window.visualViewport.height<innerHeight*.72&&innerWidth<900));
 setInterval(()=>{updateToday();renderTimer();},1000);
}
function updateToday(){const today=localDateKey(new Date());if(today!==state.lastToday){state.lastToday=today;renderAll({kind:'week'});announce('A data de hoje foi atualizada. Seu treino em andamento foi preservado.');}}
init();
