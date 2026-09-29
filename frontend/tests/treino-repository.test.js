import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkoutRepository } from '../src/js/treino/repository.js';
import demo from '../src/js/treino/data/programa-inicial.json' with { type:'json' };
function storage(){const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
test('primeiro acesso cria semana anterior completa e mantém âncora na recarga',()=>{
 const store=storage(),repo=new WorkoutRepository({storage:store,clock:()=>new Date(2026,8,27,12)});
 const first=repo.load();assert.equal(first.ok,true);assert.equal(first.data.executions.length,3);
 assert.deepEqual(first.data.executions.map(e=>e.performedDate),['2026-09-14','2026-09-16','2026-09-18']);
 assert.equal(first.data.executions.flatMap(e=>e.exercises).length,15);
 assert.deepEqual(first.data.executions[0].exercises[0].sets.filter(s=>s.type==='working').map(s=>s.actualReps),[10,10,9]);
 const second=new WorkoutRepository({storage:store,clock:()=>new Date(2026,9,11,12)}).load();
 assert.equal(second.data.seedAnchorDate,'2026-09-14');
});
test('dados corrompidos não são apagados; falha de gravação fica explícita',()=>{
 const store=storage();store.setItem('trainforge.workout-demo.v1','{broken');
 const repo=new WorkoutRepository({storage:store,clock:()=>new Date()});
 assert.equal(repo.load().ok,false);assert.equal(store.getItem('trainforge.workout-demo.v1'),'{broken');
 const fail={getItem:()=>null,setItem:()=>{throw Error('quota')},removeItem:()=>{}};
 const run=new WorkoutRepository({storage:fail,clock:()=>new Date()});
 assert.equal(run.load().ok,true);assert.equal(run.load().persisted,false);
 assert.equal(run.save(run.load().data).ok,false);
});
test('dados aninhados incompatíveis não são aceitos nem sobrescritos',()=>{
 const store=storage();const first=new WorkoutRepository({storage:store,clock:()=>new Date(2026,8,28,12)}).load();
 const broken=structuredClone(first.data);broken.executions[0].prescriptionSnapshot.exercises[0].video.embedUrl='javascript:alert(1)';
 const raw=JSON.stringify(broken);store.setItem('trainforge.workout-demo.v1',raw);
 assert.equal(new WorkoutRepository({storage:store}).load().ok,false);
 assert.equal(store.getItem('trainforge.workout-demo.v1'),raw);
});
test('fixture atende limite de 50 minutos e cargas anteriores disponíveis',()=>{
 const videos=[];
 for(const session of demo.program.sessions){assert.ok(session.estimatedMinutes<=session.availableMinutes);for(const ex of session.exercises){assert.ok(ex.availableLoadsKg.includes(ex.historyExample.loadKg),ex.id);videos.push(ex.video);}}
 assert.equal(videos.length,15);
 assert.equal(videos.filter(video=>video.author==='Muscle & Strength').length,10);
 assert.equal(videos.filter(video=>video.author==='Bodybuilding.com').length,5);
 assert.ok(videos.every(video=>video.embedUrl.startsWith('https://www.youtube.com/embed/')));
});
