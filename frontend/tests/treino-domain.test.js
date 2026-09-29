import test from 'node:test';
import assert from 'node:assert/strict';
import { localDateKey, weekDates, shiftLocalDate } from '../src/js/treino/calendar.js';
import { suggestWarmup, findReference } from '../src/js/treino/warmup.js';
import { createExecution, completeSet, undoSet, finishExecution } from '../src/js/treino/model.js';
import { startRest, remainingSeconds, extendRest } from '../src/js/treino/rest.js';

const exercise = { id:'bench', equipmentId:'barbell', loadConvention:'total', availableLoadsKg:[20,22.5,25,27.5,30,32.5,35,37.5,40], workingSets:3, repRange:[8,12], restSeconds:90, warmupPlan:{count:2,restSeconds:60,policyVersion:'demo-1'} };
const program={id:'p',version:1,sessions:[{id:'A',exercises:[exercise]}]};
const prior={id:'old',status:'completed',finishedAt:'2026-09-21T18:00:00.000Z',exercises:[{id:'bench',equipmentId:'barbell',loadConvention:'total',sets:[{type:'warmup',status:'completed',actualLoadKg:20,actualReps:8},{type:'working',status:'completed',actualLoadKg:40,actualReps:10},{type:'working',status:'completed',actualLoadKg:40,actualReps:9}]}]};

test('semana local cruza domingo, mês e ano sem usar UTC',()=>{
 assert.equal(localDateKey(new Date(2026,11,31,23,30)),'2026-12-31');
 assert.deepEqual(weekDates('2027-01-03'),['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
 assert.equal(shiftLocalDate('2026-12-31',1),'2027-01-01');
});
test('referência usa primeira série principal da última execução encerrada compatível',()=>{
 const ref=findReference([prior],exercise,'2026-09-28T10:00:00.000Z');
 assert.equal(ref.loadKg,40); assert.equal(ref.executionId,'old');
 assert.equal(findReference([prior],{...exercise,equipmentId:'smith'},'2026-09-28T10:00:00.000Z'),null);
});
test('aquecimento da barra respeita incrementos e cargas ausentes',()=>{
 assert.deepEqual(suggestWarmup(exercise,40).map(s=>[s.loadKg,s.targetReps]),[[20,8],[27.5,5]]);
 assert.equal(suggestWarmup({...exercise,availableLoadsKg:[30,40]},40)[0].loadKg,null);
});
test('execução preserva data planejada, registro idempotente e encerramento exige todas as séries',()=>{
 const started='2026-09-28T10:00:00.000Z';
 let run=createExecution(program,'A','2026-09-30',new Date(started),[prior]);
 assert.equal(run.plannedDate,'2026-09-30'); assert.equal(run.performedDate,'2026-09-28');
 assert.equal(run.exercises[0].referenceLoadKg,40);
 assert.throws(()=>completeSet(run,'bench','working-1',{load:'40',reps:''},new Date(started)),/repeti/i);
 const done=completeSet(run,'bench','working-1',{load:'40',reps:'10'},new Date(started));
 assert.equal(done.execution.exercises[0].sets.find(s=>s.id==='working-1').actualReps,10);
 assert.equal(completeSet(done.execution,'bench','working-1',{load:'40',reps:'10'},new Date(started)).restRequest,null);
 assert.throws(()=>finishExecution(done.execution,new Date(started)),/incompleto/i);
 assert.equal(undoSet(done.execution,'bench','working-1').exercises[0].sets.find(s=>s.id==='working-1').status,'pending');
});
test('descanso usa timestamps e extensão após zero começa agora',()=>{
 const now=new Date('2026-09-28T10:00:00Z');
 const rest=startRest({executionId:'e',exerciseId:'bench',setId:'working-1'},90,now);
 assert.equal(remainingSeconds(rest,new Date(now.getTime()+10000)),80);
 assert.equal(remainingSeconds(rest,new Date(now.getTime()+120000)),0);
 const extended=extendRest(rest,30,new Date(now.getTime()+120000));
 assert.equal(remainingSeconds(extended,new Date(now.getTime()+120000)),30);
});
