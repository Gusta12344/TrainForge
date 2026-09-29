import test from 'node:test';
import assert from 'node:assert/strict';
import { renderWeek } from '../src/js/treino/render.js';

const program={weeklySchedule:{1:'A',3:'B',5:'C'},sessions:[{id:'A'},{id:'B'},{id:'C'}]};
const card=(markup,date)=>markup.match(new RegExp(`<button[^>]*data-date="${date}"[^>]*>[\\s\\S]*?<\\/button>`))?.[0];

test('semana indica treino concluído, incompleto, não realizado e descanso passado',()=>{
 const data={program,seedAnchorDate:'2026-09-21',executions:[
  {plannedDate:'2026-09-21',sessionTemplateId:'A',status:'completed'},
  {plannedDate:'2026-09-23',sessionTemplateId:'B',status:'incomplete'}
 ]};
 const markup=renderWeek(data,'2026-09-21','2026-09-21','2026-09-28');
 assert.match(card(markup,'2026-09-21'),/day-completed/);
 assert.match(card(markup,'2026-09-21'),/data-lucide="check"/);
 assert.match(card(markup,'2026-09-21'),/treino concluído/);
 assert.match(card(markup,'2026-09-22'),/day-rested/);
 assert.match(card(markup,'2026-09-22'),/data-lucide="moon"/);
 assert.match(card(markup,'2026-09-23'),/treino incompleto/);
 assert.match(card(markup,'2026-09-25'),/day-missed/);
 assert.match(card(markup,'2026-09-25'),/treino não realizado/);
 assert.match(card(markup,'2026-09-25'),/data-lucide="x"/);
});

test('não classifica dias anteriores ao programa, hoje pendente ou treino ativo como falta',()=>{
 const data={program,seedAnchorDate:'2026-09-21',executions:[{plannedDate:'2026-09-21',sessionTemplateId:'A',status:'active'}]};
 const before=renderWeek(data,'2026-09-14','2026-09-14','2026-09-28');
 assert.doesNotMatch(before,/day-missed|day-rested/);
 const past=renderWeek(data,'2026-09-21','2026-09-21','2026-09-28');
 assert.doesNotMatch(card(past,'2026-09-21'),/day-missed/);
 assert.match(card(past,'2026-09-21'),/treino em andamento/);
 const current=renderWeek({...data,executions:[]},'2026-09-28','2026-09-28','2026-09-28');
 assert.doesNotMatch(card(current,'2026-09-28'),/day-missed/);
 assert.match(card(current,'2026-09-28'),/hoje/);
 assert.doesNotMatch(card(current,'2026-09-29'),/day-rested/);
});
