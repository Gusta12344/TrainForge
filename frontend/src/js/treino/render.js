import { weekDates,sessionForDate,formatDate,fromDateKey } from './calendar.js';
import { findReference,suggestWarmup } from './warmup.js';
export const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const days=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
const number=value=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:2});
export const loadLabel=convention=>({'total':'Carga total, incluindo a barra','por-halter':'kg por halter','maquina':'kg indicados na máquina'}[convention]||'kg');
function dayStatus(data,date,today,session,run) {
 if(run?.status==='completed')return {kind:'completed',label:'treino concluído',icon:'check'};
 if(run?.status==='incomplete')return {kind:'missed',label:'treino incompleto',icon:'x'};
 if(run?.status==='active')return {kind:'',label:'treino em andamento'};
 if(date>=today||date<data.seedAnchorDate)return {kind:'',label:''};
 return session?{kind:'missed',label:'treino não realizado',icon:'x'}:{kind:'rested',label:'dia de descanso passado',icon:'moon'};
}
export function renderWeek(data,weekStart,selectedDate,today) {
 const dates=weekDates(weekStart);
 return dates.map((date,i)=>{
  const session=sessionForDate(data.program,date);
  const run=session?getRun(data,session,date):null;
  const status=dayStatus(data,date,today,session,run);
  return `<button type="button" class="day-cell ${status.kind?`day-${status.kind}`:''} ${date===selectedDate?'is-selected':''}" data-date="${date}" aria-pressed="${date===selectedDate}" aria-label="${days[i]}, ${formatDate(date)}: ${session?'Treino '+session.id:'descanso'}${status.label?', '+status.label:''}${date===today?', hoje':''}"><span class="day-top"><span class="day-name">${days[i]}</span>${status.icon?`<span class="day-status" aria-hidden="true"><i data-lucide="${status.icon}" aria-hidden="true"></i></span>`:''}</span><strong class="day-number">${fromDateKey(date).getDate()}</strong><span class="day-session">${session?'Treino '+session.id:'Descanso'}</span>${date===today?'<span class="today-marker">Hoje</span>':''}</button>`;
 }).join('');
}
function getRun(data,session,date) {return data.executions.find(e=>e.plannedDate===date&&e.sessionTemplateId===session.id)||null;}
export function renderSession(data,date,today,openExerciseIds) {
 const session=sessionForDate(data.program,date),title=formatDate(date,{weekday:'long',day:'numeric',month:'long'});
 if(!session)return `<section class="rest-day state-card"><p class="eyebrow accent">${date===today?'HOJE':'DIA SELECIONADO'}</p><h2>${date===today?'Hoje é dia de descanso':'Dia de descanso'}</h2><p>${esc(title)} · Sua agenda demonstrativa não tem sessão neste dia. Você pode consultar os outros dias da semana.</p></section>`;
 const run=getRun(data,session,date);
 const completed=run?.exercises.filter(e=>e.completed).length||0, progress=completed/session.exercises.length*100;
 const startLabel='Começar treino';
 return `<section class="session-section" aria-labelledby="session-title"><div class="session-heading"><div><p class="eyebrow accent">TREINO ${session.id} · ${esc(title)}</p><h2 id="session-title">${esc(session.title)}</h2><p>${session.exercises.length} exercícios <span aria-hidden="true">•</span> Cerca de ${session.estimatedMinutes} min <span aria-hidden="true">•</span> ${run?.source==='seed'?'Histórico de exemplo':run?.status==='completed'?'Concluído':run?.status==='incomplete'?'Encerrado incompleto':run?'Em andamento':'Planejado'}</p></div><div class="progress-wrap"><span id="progress-label">${completed} de ${session.exercises.length} concluídos</span><div class="progress-track" role="progressbar" aria-label="Exercícios concluídos" aria-valuemin="0" aria-valuemax="${session.exercises.length}" aria-valuenow="${completed}"><span style="width:${progress}%"></span></div></div></div>
 ${run?.status==='completed'||run?.status==='incomplete'?`<div class="result-summary"><i data-lucide="${run.status==='completed'?'circle-check':'circle-pause'}" aria-hidden="true"></i><span>${run.status==='completed'?'Treino concluído':'Treino encerrado como incompleto'} em ${esc(formatDate(run.performedDate))}. ${run.source==='seed'?'Registro fictício de exemplo.':''}</span></div>`:''}
 ${!run?`<div class="start-panel"><div><strong>Pronto para começar?</strong><p>Os resultados serão registrados na data de hoje, mesmo ao escolher outro dia planejado.</p></div><button type="button" class="primary-action" id="start-workout">${startLabel}<i data-lucide="arrow-right" aria-hidden="true"></i></button></div>`:''}
 <div class="workout-columns"><div class="exercise-list-wrap"><h3>EXERCÍCIOS</h3><div class="exercise-list" id="exercise-list">${session.exercises.map((ex,index)=>renderExerciseEntry(ex,index,openExerciseIds,run,data,date)).join('')}</div></div></div>
 ${run?.status==='active'?`<div class="session-actions"><button type="button" id="finish-workout" class="primary-action" ${completed!==session.exercises.length?'disabled':''}>Finalizar treino<i data-lucide="check" aria-hidden="true"></i></button><button type="button" id="stop-workout" class="text-action">Encerrar por hoje</button></div>`:''}
 </section>`;
}
function renderExerciseEntry(ex,index,openExerciseIds,run,data,date) {
 const open=openExerciseIds.has(ex.id),done=run?.exercises.find(e=>e.id===ex.id)?.completed;
 return `<div class="exercise-entry" data-entry="${esc(ex.id)}"><button type="button" class="exercise-item ${open?'selected':''}" data-exercise="${esc(ex.id)}" aria-expanded="${open}" ${open?`aria-controls="exercise-detail-${esc(ex.id)}"`:''}><img src="${esc(ex.poster)}" alt="" loading="lazy" /><span class="exercise-number">${String(index+1).padStart(2,'0')}</span><span class="exercise-copy"><strong>${esc(ex.name)}</strong><small>${ex.workingSets} séries <span aria-hidden="true">•</span> ${ex.repRange.join('–')} repetições</small></span>${done?'<i data-lucide="circle-check" aria-hidden="true" class="done-icon"></i>':''}<i data-lucide="chevron-down" aria-hidden="true" class="exercise-chevron"></i></button>${open?renderExerciseDetail(data,date,ex.id):''}</div>`;
}
export function renderExerciseDetail(data,date,exerciseId) {
 const session=sessionForDate(data.program,date),ex=session?.exercises.find(item=>item.id===exerciseId);
 if(!ex)return '';
 const run=getRun(data,session,date);
 return `<article class="exercise-detail" id="exercise-detail-${esc(ex.id)}" aria-label="Detalhes de ${esc(ex.name)}"><div class="exercise-detail-inner">${renderDetail(ex,session.exercises.indexOf(ex),session,run,data.executions,Boolean(run&&run.status!=='active'))}</div></article>`;
}
function renderDetail(ex,index,session,run,history,viewOnly) {
 const item=run?.exercises.find(e=>e.id===ex.id);
 const ref=findReference(history.filter(e=>e.id!==run?.id),ex,run?.startedAt||new Date().toISOString());
 const suggestions=item?.suggestedWarmup??(ref?suggestWarmup(ex,ref.loadKg):[]);
 const meta=`<div class="exercise-meta"><span><i data-lucide="layers" aria-hidden="true"></i>${ex.workingSets} séries principais</span><span><i data-lucide="repeat-2" aria-hidden="true"></i>${ex.repRange.join('–')} repetições</span><span><i data-lucide="clock-3" aria-hidden="true"></i>Descanso: ${ex.restSeconds} s</span></div>`;
 return `<header class="detail-heading"><div><h3>${esc(ex.name)}</h3><p>Exercício ${String(index+1).padStart(2,'0')} de ${String(session.exercises.length).padStart(2,'0')} · ${esc(ex.primaryMuscles)}</p></div></header><div class="media-frame"><img src="${esc(ex.poster)}" alt="Ilustração de academia; consulte o vídeo para a execução" /><button type="button" class="play-button" data-play="${esc(ex.id)}" aria-label="Ver execução de ${esc(ex.name)}"><i data-lucide="play" aria-hidden="true"></i><span>Ver execução</span></button><span class="media-note">Imagem ilustrativa</span></div><div class="media-link"><a href="${esc(ex.video.sourceUrl)}" target="_blank" rel="noopener noreferrer">Abrir vídeo na fonte <i data-lucide="external-link" aria-hidden="true"></i></a></div><details class="media-instructions"><summary>Orientações sem vídeo</summary><ul>${ex.instructions.map(instruction=>`<li>${esc(instruction)}</li>`).join('')}</ul></details>${meta}
 <div class="history-panel"><div><p class="eyebrow accent">ÚLTIMA VEZ</p>${ref?`<strong>${esc(formatDate(ref.date))}</strong><p>${ref.sets.map((s,i)=>`${i+1}: ${s.loadKg==null?'—':number(s.loadKg)+' kg'} × ${s.reps??'—'}`).join(' · ')}</p>`:'<p>Sem execução anterior compatível. Informe uma carga de referência para sugerir o aquecimento.</p>'}</div></div>
 ${run?`<div class="reference-panel"><div><label for="reference-load-${esc(ex.id)}">Carga de referência <small>(${loadLabel(ex.loadConvention)})</small></label><p>Usada apenas para sugerir aquecimento nesta execução.</p></div><div class="reference-control"><input class="reference-load" id="reference-load-${esc(ex.id)}" type="text" inputmode="decimal" value="${item.referenceLoadKg??''}" ${viewOnly||item.sets.some(s=>s.status==='completed')?'disabled':''} aria-describedby="reference-help-${esc(ex.id)}" /><button type="button" class="secondary-action" data-apply-reference ${viewOnly||item.sets.some(s=>s.status==='completed')?'disabled':''}>Aplicar</button></div><small id="reference-help-${esc(ex.id)}">${esc(item.referenceSource==='manual'?'Referência informada nesta sessão':item.referenceSource?'Primeira série principal concluída da última execução':'Informe a carga antes de registrar a primeira série')}</small><p class="field-error reference-error" hidden></p></div>`:''}
 <div class="set-section"><div class="set-heading"><h4>AQUECIMENTO SUGERIDO</h4><span>${ex.warmupPlan.count} ${ex.warmupPlan.count===1?'série':'séries'}</span></div><p class="help">Prepare o movimento sem buscar a falha. Ajuste a carga se necessário. ${esc(ex.warmupPlan.reason)}.</p>${run?item.sets.filter(s=>s.type==='warmup').map((s,i)=>renderSet(ex,s,i,viewOnly)).join(''):suggestions.map((s,i)=>`<p class="preview-set">A${i+1} · ${s.loadKg==null?esc(s.reason):number(s.loadKg)+' kg × '+s.targetReps+' repetições'}</p>`).join('')||'<p class="help">Comece uma execução para informar a referência.</p>'}</div>
 <div class="set-section working-section"><div class="set-heading"><h4>SÉRIES PRINCIPAIS</h4><span>${ex.workingSets} × ${ex.repRange.join('–')}</span></div><p class="help">${loadLabel(ex.loadConvention)}. Registre as repetições realizadas.</p>${run?item.sets.filter(s=>s.type==='working').map((s,i)=>renderSet(ex,s,i,viewOnly)).join(''):'<p class="help">Inicie a execução para registrar suas séries.</p>'}</div>
 ${run?.status==='active'?`<button type="button" class="primary-action exercise-finish" data-complete-exercise ${item.completed?'disabled':''}>${item.completed?'Exercício concluído':'Concluir exercício'}<i data-lucide="arrow-right" aria-hidden="true"></i></button>`:''}<p class="detail-error" role="alert" hidden></p>`;
}
function renderSet(ex,set,index,viewOnly) {
 const label=set.type==='warmup'?`A${index+1}`:String(index+1).padStart(2,'0'),done=set.status==='completed',skipped=set.status==='skipped';
 const target=set.type==='warmup'?`${set.suggestedLoadKg==null?'Sem sugestão compatível':number(set.suggestedLoadKg)+' kg'} × ${set.targetReps}`:`${ex.repRange.join('–')} repetições`;
 const disabled=viewOnly||done||skipped;
 return `<div class="set-row ${done?'done':''} ${skipped?'skipped':''}" data-set="${esc(set.id)}"><div class="set-index"><strong>${label}</strong><small>${set.type==='warmup'?'Aquecimento':'Principal'}</small></div><div class="set-fields"><label>Carga <small>kg</small><input type="text" inputmode="decimal" data-field="load" value="${set.actualLoadKg??(viewOnly?'':set.suggestedLoadKg??'')}" placeholder="—" ${disabled?'disabled':''} aria-label="${label}, carga em kg" /></label><label>Repetições<input type="text" inputmode="numeric" data-field="reps" value="${set.actualReps??''}" placeholder="${set.type==='warmup'?set.targetReps:'—'}" ${disabled?'disabled':''} aria-label="${label}, repetições realizadas" /></label></div><div class="set-actions">${renderSetActions(set,label,viewOnly)}</div><p class="set-target">Meta: ${target}</p><p class="field-error" data-error hidden></p></div>`;
}
export function renderCompletedSetActions(setId,viewOnly=false) {
 const completedStatus='<span class="set-status"><i data-lucide="check" aria-hidden="true"></i>Concluído</span>';
 return viewOnly?completedStatus:`${completedStatus}<button type="button" class="undo-link" data-undo="${esc(setId)}"><i data-lucide="rotate-ccw" aria-hidden="true"></i>Desfazer</button>`;
}
function renderSetActions(set,label,viewOnly) {
 const done=set.status==='completed',skipped=set.status==='skipped';
 if(viewOnly)return done?renderCompletedSetActions(set.id,true):skipped?'Não realizado':'—';
 if(done)return renderCompletedSetActions(set.id);
 if(skipped)return `<button type="button" class="set-button" disabled aria-label="Aquecimento não realizado"><i data-lucide="x" aria-hidden="true"></i></button><button type="button" class="undo-link" data-undo="${esc(set.id)}">Desfazer</button>`;
 return `<button type="button" class="set-button" data-complete="${esc(set.id)}" aria-label="Concluir série ${label}"><i data-lucide="check" aria-hidden="true"></i></button>${set.type==='warmup'?`<button type="button" class="skip-button" data-skip="${esc(set.id)}">Não realizado</button>`:''}`;
}
export function renderRest(rest,remaining,exerciseName) {
 const minutes=String(Math.floor(remaining/60)).padStart(2,'0'),seconds=String(remaining%60).padStart(2,'0');
 return `<div class="rest-top"><div><p class="eyebrow accent">DESCANSO · ${esc(exerciseName)}</p><strong id="rest-clock">${minutes}:${seconds}</strong></div><button type="button" class="icon-button rest-expand" id="toggle-rest-details" aria-label="Mostrar ações do descanso" aria-expanded="false"><i data-lucide="chevron-down" aria-hidden="true"></i></button><button type="button" class="icon-button" id="end-rest" aria-label="Encerrar descanso"><i data-lucide="x" aria-hidden="true"></i></button></div><div class="rest-progress"><span id="rest-progress" style="width:${Math.min(100,remaining/(rest.suggestedSeconds+rest.extensionSeconds)*100)}%"></span></div><p id="rest-message" data-done="${!remaining}">${remaining?'Série concluída. Próxima quando estiver pronto.':'Tempo sugerido concluído. Continue quando estiver pronto.'}</p><p class="rest-advice">Este tempo é uma referência. Descanse mais se precisar.</p><div class="rest-actions"><button type="button" id="extend-rest" class="secondary-action">+30 s</button><button type="button" id="end-rest-text" class="text-action">Encerrar descanso</button></div>`;
}
