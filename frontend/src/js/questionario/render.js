import { steps, days, places, equipment, options, questions, stepQuestions, applies, activePlaces, selectedDays, hasVolley, overlaps, label, projectAnswers } from './model.js';
export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
export function choice(name, choices, value, {multiple=false, style='', exclusive=[]}={}) {
 return `<div class="choices ${style}">${choices.map(([v,text,description,glyph],i)=>`<label class="choice ${glyph?'with-icon':''}"><input id="${esc(name)}-${i}" type="${multiple?'checkbox':'radio'}" name="${esc(name)}" value="${esc(v)}" ${style==='days'?`aria-label="${esc(text)}"`:''} ${multiple?'data-multiple':''} ${exclusive.length?`data-exclusive="${esc(exclusive.join('|'))}"`:''} ${multiple ? (value??[]).includes(v)?'checked':'' : value===v?'checked':''}><span class="choice-face">${glyph?icon(glyph):''}<span class="choice-copy"><span>${esc(style==='days'?['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][Number(v)]:text)}</span>${description?`<small>${esc(description)}</small>`:''}</span><span class="choice-mark" aria-hidden="true">${multiple?icon('check'):''}</span></span></label>`).join('')}</div>`;
}
function field(name, title, value, {unit='',type='text',mode='',placeholder=''}={}) {
 return `<label class="text-field" for="${esc(name)}"><span>${esc(title)}</span><span class="input-wrap"><input id="${esc(name)}" name="${esc(name)}" type="${type}" value="${esc(value)}" ${mode?`inputmode="${mode}"`:''} ${placeholder?`placeholder="${esc(placeholder)}"`:''} autocomplete="off">${unit?`<span class="unit">${unit}</span>`:''}</span></label>`;
}
function select(name,title,value,choices) {
 return `<label class="text-field" for="${esc(name)}"><span>${esc(title)}</span><select id="${esc(name)}" name="${esc(name)}"><option value="">Selecione</option>${choices.map(([v,t])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
}
const help = text => `<p class="question-help">${text}</p>`;
const note = text => `<p class="pending-note">${icon('info')}<span>${text}</span></p>`;
const intensity = [['low','Pouco'],['medium','Moderadamente'],['high','Muito']];
export function eventList(a,kind) {
 const sports=kind==='sportEvents';
 const events=a[kind];
 return `<div class="event-list">${events.map((e,i)=>{
  const prefix=`${kind}.${e.id}`;
  const activities=[...(hasVolley(a)?[['volleyball','Vôlei']]:[]),...(['other','both'].includes(a.Q11)?[['other',a.otherSport||'Outro esporte']]:[])];
  return `<section class="event-row" data-event="${e.id}"><div class="event-heading"><h3>${sports?'Compromisso':'Atividade'} ${i+1}</h3><button type="button" class="text-button remove-event" data-remove="${kind}" data-id="${e.id}" aria-label="Remover ${sports?'compromisso':'atividade'} ${i+1}">${icon('trash-2')}<span>Remover</span></button></div><div class="fields-grid">${sports?select(`${prefix}.activity`,'Atividade',e.activity,activities)+select(`${prefix}.type`,'Tipo',e.type,[['training','Treino'],['game','Jogo ou competição']])+select(`${prefix}.day`,'Dia da semana',e.day,options.Q15):field(`${prefix}.name`,'Nome da atividade',e.name)}${field(`${prefix}.minutes`,'Tempo por sessão',e.minutes,{unit:'min',mode:'numeric'})}${select(`${prefix}.intensity`,'Exigência física',e.intensity,intensity)}</div>${!sports?`<fieldset class="nested-fieldset"><legend>Dias da atividade</legend>${choice(`${prefix}.days`,options.Q15,e.days,{multiple:true,style:'days'})}</fieldset>`:''}</section>`;
 }).join('')}</div><button type="button" class="secondary-button" data-add="${kind}">${icon('plus')} Adicionar ${sports?'compromisso':'atividade'}</button>`;
}
function content(q,a) {
 switch(q) {
 case 'Q01': return choice(q,options[q],a[q],{style:'objectives'});
 case 'Q02': return choice(q,options[q],a[q]);
 case 'Q03': return help('Opcional. O esporte continua sendo a prioridade.')+choice(q,options[q],a[q],{style:'complements'});
 case 'Q04': return help('Escolha até duas regiões. Essa preferência não exclui o trabalho das demais.')+choice(q,options[q],a[q],{multiple:true,style:'chips muscles',exclusive:['none']});
 case 'Q05': case 'Q06': case 'Q07': return field(q,questions[q],a[q],{unit:{Q05:'anos',Q06:'cm',Q07:'kg'}[q],mode:q==='Q05'?'numeric':'decimal',placeholder:{Q05:'Ex.: 25',Q06:'Ex.: 175',Q07:'Ex.: 72,5'}[q]});
 case 'Q08': return help('Considere os períodos em que você treinou com regularidade.')+choice(q,options[q],a[q],{style:'two-cols'});
 case 'Q11': return choice(q,options[q],a[q],{style:'two-cols'})+(['other','both'].includes(a.Q11)?`<div class="follow-up">${field('otherSport','Qual é o outro esporte?',a.otherSport)}</div>`:'');
 case 'Q13': return help('Registre treinos e jogos separadamente, mesmo quando acontecem no mesmo dia.')+`<label class="plain-check"><input type="checkbox" name="variable" ${a.variable?'checked':''}> Minha rotina varia</label>`+(a.variable?`<div class="follow-up">${field('week','Data de início da semana de referência',a.week,{type:'date'})}${help('Os compromissos abaixo representam os sete dias a partir dessa data.')}</div>`:'')+eventList(a,'sportEvents');
 case 'Q14': return help('Informe somente atividades que continuarão junto com o novo programa. Não repita treinos e jogos já cadastrados.')+choice(q,options[q],a[q])+ (a.Q14==='yes'?`<div class="follow-up">${eventList(a,'otherEvents')}</div>`:'');
 case 'Q15': return choice(q,options[q],a[q],{multiple:true,style:'days'})+help('São dias disponíveis. O programa não precisa usar todos eles.');
 case 'Q16': return field(q,'Quantidade de dias',a[q],{unit:'dias',mode:'numeric'})+help(a.Q15.length?`${a.Q15.length} dias disponíveis selecionados.`:'Selecione os dias disponíveis primeiro.');
 case 'Q17': return help('Inclua aquecimento e intervalos no tempo disponível.')+(a.Q15.length?`<div class="same-time">${field('commonTime','Mesmo tempo para os dias selecionados',a.commonTime,{unit:'min',mode:'numeric'})}<button type="button" class="secondary-button" data-apply-time>Aplicar a todos</button></div><div class="fields-grid">${selectedDays(a).map(d=>field(`times.${d}`,days[d],a.times[d],{unit:'min',mode:'numeric'})).join('')}</div>`:help('Os campos aparecerão depois que você escolher os dias.'));
 case 'Q18': return choice(q,options[q],a[q])+ (a.Q18==='same'&&overlaps(a).length?`<div class="follow-up fields-grid">${overlaps(a).map(d=>select(`timing.${d}`,days[d],a.timing[d],[['before','Antes do esporte'],['after','Depois do esporte'],['unknown','Horário ainda não definido']])).join('')}</div>`:'');
 case 'Q19': return choice(q,options[q],a[q],{style:'two-cols'})+(a.Q19==='multiple'?`<div class="follow-up fields-grid">${selectedDays(a).map(d=>select(`locations.${d}`,days[d],a.locations[d],places)).join('')}</div>`:'');
 case 'Q20': return activePlaces(a).map(p=>`<fieldset class="equipment-group" data-motion-key="${p}"><legend>${esc(places.find(x=>x[0]===p)?.[1])}</legend>${choice(`gear.${p}`,equipment,a.gear[p],{multiple:true,style:'two-cols',exclusive:['none']})}${a.gear[p]?.includes('machines')?note('A seleção das máquinas específicas ainda não está disponível.') : ''}${a.gear[p]?.includes('unknown')?note('Equipamentos que você não identificou não serão considerados disponíveis.') : ''}</fieldset>`).join('')||help('Escolha primeiro onde você irá treinar.');
 case 'Q22': return help('Informe restrições já identificadas por um profissional de saúde ou de educação física. Este formulário não realiza diagnóstico.')+choice(q,options[q],a[q])+(a.Q22==='unsure'?note('Sua dúvida aparecerá na revisão. Este questionário não avalia nem libera a prática de exercícios.'):'');
 case 'Q23': return note('O detalhamento das orientações ainda não está disponível. Sua indicação de restrição aparecerá na revisão.');
 case 'Q24': return choice(q,options[q],a[q],{multiple:true,style:'two-cols',exclusive:['none','unknown']});
 default: return choice(q,options[q],a[q],{style:'two-cols'});
 }
}
export function blocks(step,a) {
 return stepQuestions[step].filter(q=>applies(q,a)).map(q=>({id:q,html:`<fieldset class="question ${['Q05','Q06','Q07'].includes(q)?'numeric-question':''}" id="group-${q}" data-block="${q}"><legend>${questions[q]}</legend>${content(q,a)}<p class="field-error" id="error-${q}" hidden></p></fieldset>`}));
}
const descriptions = [
 'Defina a prioridade do seu programa.', 'Seu ponto de partida ajuda a organizar o programa.', 'O que já faz parte da sua semana também conta.',
 'Agora informe quando você pode fazer os treinos que o TrainForge vai montar. Seus treinos e jogos serão considerados separadamente.',
 'Conte com o que você tem disponível em cada local.', 'Registre as orientações que você já recebeu.', 'Confira cada informação. Você pode voltar e ajustar suas respostas.',
];
const titles = [['COMECE PELO','SEU OBJETIVO.'],['SEU PONTO','DE PARTIDA.'],['SUA ROTINA','EM MOVIMENTO.'],['SEU TREINO.','NO SEU TEMPO.'],['SEU ESPAÇO.','SUAS POSSIBILIDADES.'],['CUIDADO EM','CADA ESCOLHA.'],['TUDO CERTO','PARA CONTINUAR?']];
export function heading(step) {
 return `<header class="step-heading"><h1 id="step-title" tabindex="-1">${titles[step].map((t,i)=>`<span class="title-mask ${step===0&&i===0?'intro-line':''}"><span class="title-line ${i?'accent':''}">${t}</span></span>`).join('')}</h1><p>${descriptions[step]}</p></header>`;
}
export function renderReview(a) {
 const p=projectAnswers(a);
 const row=(key,value)=>`<div class="review-row"><dt>${esc(key)}</dt><dd>${esc(value || 'Não informado')}</dd></div>`;
 const joins=(q)=>Array.isArray(p[q])?p[q].map(v=>label(q,v)).join(', '):label(q,p[q]);
 const eventDescription=(e,sport)=>`${sport?e.activity==='volleyball'?'Vôlei':a.otherSport:e.name} · ${sport?e.type==='training'?'Treino':'Jogo/competição':'Atividade física'} · ${sport?days[e.day]:(e.days??[]).map(d=>days[d]).join(', ')} · ${e.minutes} min · ${intensity.find(v=>v[0]===e.intensity)?.[1]}`;
 return stepQuestions.map((qs,s)=>{
  let rows='';
  for(const q of qs.filter(q=>applies(q,a))) {
   if(q==='Q13') { rows+=row('Semana',p.variable?`A partir de ${p.week?.split('-').reverse().join('/')}`:'Rotina habitual'); rows+=p.sportEvents.map((e,i)=>row(`Compromisso ${i+1}`,eventDescription(e,true))).join(''); continue; }
   if(q==='Q17') { rows+=row('Tempo disponível',selectedDays(a).map(d=>`${days[d]}: ${p.times[d]} min`).join(' · ')); continue; }
   if(q==='Q20') { rows+=activePlaces(a).map(loc=>row(`Equipamentos · ${places.find(x=>x[0]===loc)?.[1]}`,(p.gear[loc]??[]).map(v=>equipment.find(x=>x[0]===v)?.[1]).join(', '))).join(''); continue; }
   if(q==='Q23') { rows+=row(questions[q],'Detalhamento de orientações indisponível.'); continue; }
   rows+=row(questions[q],joins(q)+({Q05:' anos',Q06:' cm',Q07:' kg',Q16:' dias'}[q]??''));
   if(q==='Q11' && p.otherSport) rows+=row('Outro esporte',p.otherSport);
   if(q==='Q14'&&p.otherEvents) rows+=p.otherEvents.map((e,i)=>row(`Outra atividade ${i+1}`,eventDescription(e,false))).join('');
   if(q==='Q18'&&p.timing) rows+=Object.entries(p.timing).map(([d,v])=>row(days[d],{before:'Antes do esporte',after:'Depois do esporte',unknown:'Horário ainda não definido'}[v])).join('');
   if(q==='Q19'&&p.locations) rows+=Object.entries(p.locations).map(([d,v])=>row(days[d],places.find(x=>x[0]===v)?.[1])).join('');
  }
  return `<section class="review-section" id="review-${s}"><div class="review-heading"><h2><span aria-hidden="true">${String(s+1).padStart(2,'0')}</span> ${steps[s]}</h2><button type="button" class="text-button" id="edit-${s}" data-edit="${s}" aria-label="Editar ${steps[s]}">${icon('pencil')} Editar</button></div><dl>${rows}</dl></section>`;
 }).join('')+`<div class="generation-notice">${icon('info')}<div><strong>Geração de programas indisponível</strong><p>Você pode conferir e editar suas respostas. A geração de programas ainda não está disponível, e as respostas não são salvas ao sair desta página.</p></div></div>`;
}
