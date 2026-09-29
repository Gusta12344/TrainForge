import { localDateKey } from './calendar.js';
import { findReference, suggestWarmup } from './warmup.js';

const copy=value=>structuredClone(value);
export function parseLoad(value) {
 const raw=String(value??'').trim().replace(',','.');
 if(!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new Error('Informe uma carga válida em kg.');
 const result=Number(raw);
 if(!Number.isFinite(result)||result>1000) throw new Error('Informe uma carga válida em kg.');
 return result;
}
export function parseReps(value) {
 const raw=String(value??'').trim();
 if(!/^\d+$/.test(raw)||Number(raw)<1||Number(raw)>1000) throw new Error('Informe repetições inteiras positivas.');
 return Number(raw);
}
/** A snapshot freezes this program's prescription for an execution. */
export function createExecution(program,sessionId,plannedDate,now,history=[],profileId='demo-profile') {
 const session=program.sessions.find(s=>s.id===sessionId); if(!session) throw new Error('Sessão inválida');
 const startedAt=now.toISOString();
 return {id:`${profileId}-${sessionId}-${localDateKey(now)}`,profileId,programId:program.id,programVersion:program.version,sessionTemplateId:sessionId,
  plannedDate,performedDate:localDateKey(now),startedAt,finishedAt:null,status:'active',source:'local',prescriptionSnapshot:copy(session),rest:null,
  exercises:session.exercises.map(exercise=>{
   const ref=findReference(history,exercise,startedAt); const suggested=ref?suggestWarmup(exercise,ref.loadKg):[];
   return {id:exercise.id,equipmentId:exercise.equipmentId,loadConvention:exercise.loadConvention,referenceLoadKg:ref?.loadKg??null,referenceSource:ref?.executionId??null,referenceRuleVersion:'demo-1',suggestedWarmup:suggested,completed:false,
    sets:[...Array.from({length:exercise.warmupPlan.count},(_,i)=>({id:`warmup-${i+1}`,type:'warmup',targetReps:i===0?8:5,suggestedLoadKg:suggested[i]?.loadKg??null,actualLoadKg:null,actualReps:null,status:'pending',completedAt:null})),
      ...Array.from({length:exercise.workingSets},(_,i)=>({id:`working-${i+1}`,type:'working',targetReps:exercise.repRange, suggestedLoadKg:ref?.loadKg??null,actualLoadKg:null,actualReps:null,status:'pending',completedAt:null}))]};
  })};
}
export function setReference(execution,exerciseId,value) {
 const next=copy(execution),item=next.exercises.find(e=>e.id===exerciseId),prescription=next.prescriptionSnapshot.exercises.find(e=>e.id===exerciseId);
 if(!item||!prescription) throw new Error('Exercício inválido');
 if(item.sets.some(s=>s.status==='completed')) throw new Error('A referência está fixa após a primeira série.');
 const load=parseLoad(value);item.referenceLoadKg=load;item.referenceSource='manual';item.suggestedWarmup=suggestWarmup(prescription,load);
 item.sets.forEach((set,i)=>{if(set.status!=='pending')return;set.suggestedLoadKg=set.type==='warmup'?item.suggestedWarmup[i]?.loadKg??null:load;});
 return next;
}
export function completeSet(execution,exerciseId,setId,actual,now=new Date()) {
 const next=copy(execution),exercise=next.exercises.find(e=>e.id===exerciseId),prescription=next.prescriptionSnapshot.exercises.find(e=>e.id===exerciseId);
 if(next.status!=='active'||!exercise||!prescription) throw new Error('Execução indisponível');
 const set=exercise.sets.find(s=>s.id===setId);if(!set)throw new Error('Série inválida');
 if(set.status==='completed')return {execution:next,restRequest:null};
 const actualLoadKg=parseLoad(actual.load),actualReps=parseReps(actual.reps);
 set.actualLoadKg=actualLoadKg;set.actualReps=actualReps;set.status='completed';set.completedAt=now.toISOString();
 const allSets=next.exercises.flatMap(e=>e.sets);const last=allSets.every(s=>s.status==='completed'||s.status==='skipped');
 return {execution:next,restRequest:last?null:{executionId:next.id,exerciseId,setId,seconds:set.type==='warmup'?prescription.warmupPlan.restSeconds:prescription.restSeconds}};
}
export function skipWarmup(execution,exerciseId,setId) {
 const next=copy(execution),set=next.exercises.find(e=>e.id===exerciseId)?.sets.find(s=>s.id===setId);
 if(!set||set.type!=='warmup'||set.status==='completed'||next.status!=='active')throw new Error('Aquecimento indisponível');
 set.status='skipped';set.actualLoadKg=null;set.actualReps=null;set.completedAt=null;return next;
}
export function undoSet(execution,exerciseId,setId) {
 const next=copy(execution),item=next.exercises.find(e=>e.id===exerciseId),set=item?.sets.find(s=>s.id===setId);
 if(!set||next.status!=='active')throw new Error('Série indisponível');
 set.status='pending';set.actualLoadKg=null;set.actualReps=null;set.completedAt=null;item.completed=false;
 if(next.rest?.exerciseId===exerciseId&&next.rest?.setId===setId)next.rest=null;
 return next;
}
export function updateSet(execution,exerciseId,setId,load,reps) {
 const next=copy(execution),set=next.exercises.find(e=>e.id===exerciseId)?.sets.find(s=>s.id===setId);
 if(!set||next.status!=='active')throw new Error('Série indisponível');
 set.actualLoadKg=load==null?null:parseLoad(load);set.actualReps=reps==null?null:parseReps(reps);return next;
}
export function completeExercise(execution,exerciseId) {
 const next=copy(execution),item=next.exercises.find(e=>e.id===exerciseId);
 if(!item||next.status!=='active')throw new Error('Exercício indisponível');
 if(item.sets.some(s=>s.status==='pending')||item.sets.some(s=>s.type==='working'&&s.status!=='completed'))throw new Error('Exercício incompleto: registre ou dispense os aquecimentos e conclua as séries principais.');
 item.completed=true;return next;
}
export function finishExecution(execution,now=new Date(),incomplete=false) {
 const next=copy(execution);
 if(next.status!=='active')return next;
 if(!incomplete&&next.exercises.some(e=>!e.completed))throw new Error('Treino incompleto: conclua todos os exercícios.');
 next.status=incomplete?'incomplete':'completed';next.finishedAt=now.toISOString();next.rest=null;return next;
}
