import initialProgram from './data/programa-inicial.json' with { type: 'json' };
import { weekDates, shiftLocalDate, fromDateKey } from './calendar.js';
import { createExecution } from './model.js';
export const STORAGE_KEY='trainforge.workout-demo.v1';
const clone=value=>structuredClone(value);
function seed(now) {
 const monday=shiftLocalDate(weekDates(now)[0],-7);
 const data={schemaVersion:1,seedVersion:1,seedAnchorDate:monday,profile:clone(initialProgram.profile),program:clone(initialProgram.program),preferences:{sidebarCollapsed:false},executions:[]};
 for(const [offset,id] of [[0,'A'],[2,'B'],[4,'C']]) {
  const date=shiftLocalDate(monday,offset),started=fromDateKey(date);started.setHours(9,0,0,0);
  const run=createExecution(data.program,id,date,started,[],data.profile.id);
  run.id=`seed-${id}-${date}`;run.source='seed';run.status='completed';
  const finished=new Date(started.getTime()+40*60000);run.finishedAt=finished.toISOString();
  run.exercises.forEach((item,index)=>{
   const ex=run.prescriptionSnapshot.exercises[index],sample=ex.historyExample;
   item.referenceLoadKg=sample.loadKg;item.referenceSource='seed';item.completed=true;
   item.sets.forEach((set,i)=>{
    set.status='completed';set.actualLoadKg=set.type==='working'?sample.loadKg:ex.availableLoadsKg.filter(n=>n<sample.loadKg&&n<=sample.loadKg*(i===0?.5:.7)).at(-1)??sample.loadKg;
    set.actualReps=set.type==='working'?sample.reps[i-ex.warmupPlan.count]:set.targetReps;
    set.completedAt=new Date(started.getTime()+(index*7+i+1)*60000).toISOString();
   });
  });
  data.executions.push(run);
 }
 return data;
}
const isRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const isDateKey=value=>{try{return typeof value==='string'&&fromDateKey(value) instanceof Date;}catch{return false;}};
const isTimestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const isHttpsUrl=(value,hosts)=>{try{const url=new URL(value);return url.protocol==='https:'&&hosts.includes(url.hostname);}catch{return false;}};
function validExercise(ex) {
 return isRecord(ex)&&typeof ex.id==='string'&&typeof ex.name==='string'&&typeof ex.primaryMuscles==='string'&&typeof ex.equipmentId==='string'&&['total','por-halter','maquina'].includes(ex.loadConvention)
  &&Number.isInteger(ex.workingSets)&&ex.workingSets>0&&Array.isArray(ex.repRange)&&ex.repRange.length===2&&ex.repRange.every(Number.isInteger)
  &&Number.isInteger(ex.restSeconds)&&ex.restSeconds>0&&[1,2].includes(ex.warmupPlan?.count)&&Number.isInteger(ex.warmupPlan.restSeconds)&&typeof ex.warmupPlan.reason==='string'
  &&Array.isArray(ex.availableLoadsKg)&&ex.availableLoadsKg.length>0&&ex.availableLoadsKg.every((load,i)=>Number.isFinite(load)&&load>=0&&(i===0||load>ex.availableLoadsKg[i-1]))
  &&typeof ex.poster==='string'&&/^\/assets\/treino\/[a-z0-9-]+\.webp$/.test(ex.poster)&&Array.isArray(ex.instructions)&&ex.instructions.every(item=>typeof item==='string')
  &&isRecord(ex.video)&&isHttpsUrl(ex.video.sourceUrl,['www.muscleandstrength.com','www.youtube.com'])&&isHttpsUrl(ex.video.embedUrl,['www.youtube.com']);
}
function validSession(session) {
 return isRecord(session)&&typeof session.id==='string'&&typeof session.title==='string'&&Number.isFinite(session.estimatedMinutes)
  &&Array.isArray(session.exercises)&&session.exercises.length>0&&session.exercises.every(validExercise);
}
function validSet(set) {
 return isRecord(set)&&typeof set.id==='string'&&['warmup','working'].includes(set.type)&&['pending','completed','skipped'].includes(set.status)
  &&(set.actualLoadKg===null||Number.isFinite(set.actualLoadKg))&&(set.actualReps===null||Number.isInteger(set.actualReps))
  &&(set.completedAt===null||isTimestamp(set.completedAt));
}
function validRest(rest) {
 return rest===null||(isRecord(rest)&&['active','ended'].includes(rest.status)&&typeof rest.executionId==='string'&&typeof rest.exerciseId==='string'&&typeof rest.setId==='string'
  &&isTimestamp(rest.startedAt)&&isTimestamp(rest.endsAt)&&Number.isFinite(rest.suggestedSeconds)&&Number.isFinite(rest.extensionSeconds));
}
function validExecution(run) {
 if(!isRecord(run)||typeof run.id!=='string'||!['active','completed','incomplete'].includes(run.status)||!isDateKey(run.plannedDate)||!isDateKey(run.performedDate)||!isTimestamp(run.startedAt)||(run.finishedAt!==null&&!isTimestamp(run.finishedAt))||!validRest(run.rest)||!validSession(run.prescriptionSnapshot)||!Array.isArray(run.exercises))return false;
 if(run.exercises.length!==run.prescriptionSnapshot.exercises.length)return false;
 return run.exercises.every((item,index)=>isRecord(item)&&item.id===run.prescriptionSnapshot.exercises[index].id&&typeof item.completed==='boolean'&&Array.isArray(item.sets)&&item.sets.length===run.prescriptionSnapshot.exercises[index].warmupPlan.count+run.prescriptionSnapshot.exercises[index].workingSets&&item.sets.every(validSet));
}
function validate(data) {
 return isRecord(data)&&data.schemaVersion===1&&data.seedVersion===1&&isDateKey(data.seedAnchorDate)&&isRecord(data.profile)&&typeof data.profile.name==='string'
  &&isRecord(data.program)&&['demo-abc','initial-abc'].includes(data.program.id)&&isRecord(data.program.weeklySchedule)&&Array.isArray(data.program.sessions)&&data.program.sessions.length===3&&data.program.sessions.every(validSession)
  &&isRecord(data.preferences)&&typeof data.preferences.sidebarCollapsed==='boolean'&&Array.isArray(data.executions)&&data.executions.every(validExecution);
}
export class WorkoutRepository {
 constructor({storage=globalThis.localStorage,clock=()=>new Date()}={}) {this.storage=storage;this.clock=clock;this.memory=null;}
 load() {
  if(this.memory)return {ok:true,data:clone(this.memory),persisted:this.persisted};
  let raw;
  try{raw=this.storage.getItem(STORAGE_KEY);}catch(error){raw=null;this.readError=error;}
  if(raw!=null){try{const data=JSON.parse(raw);if(!validate(data))return {ok:false,error:'Versão desconhecida ou dados incompatíveis. Seus dados permanecem intactos.'};this.memory=data;this.persisted=true;return {ok:true,data:clone(data),persisted:true};}catch{return {ok:false,error:'Os dados locais do treino estão corrompidos. Eles não foram apagados.'};}}
  const data=seed(this.clock());const saved=this.save(data);return {ok:true,data:clone(data),persisted:saved.ok,error:saved.error};
 }
 save(data) {
  if(!validate(data))return {ok:false,error:'Os dados não passaram na validação e não foram gravados.'};
  this.memory=clone(data);
  try{this.storage.setItem(STORAGE_KEY,JSON.stringify(data));this.persisted=true;return {ok:true};}
  catch{this.persisted=false;return {ok:false,error:'Não foi possível salvar neste navegador. O treino continua apenas nesta aba.'};}
 }
 resetDemo(now=this.clock()) {
  try{this.storage.removeItem(STORAGE_KEY);}catch{return {ok:false,error:'Não foi possível remover os dados locais do treino.'};}
  this.memory=null;return this.save(seed(now));
 }
}
