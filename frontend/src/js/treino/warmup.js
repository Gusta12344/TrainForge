/** Select a prior, closed execution using the same equipment and load convention. */
export function findReference(executions,exercise,beforeTimestamp) {
 const eligible=executions.filter(run=>run.status==='completed'&&run.finishedAt&&run.finishedAt<beforeTimestamp)
  .sort((a,b)=>b.finishedAt.localeCompare(a.finishedAt));
 for(const run of eligible) {
  const match=run.exercises.find(item=>item.id===exercise.id&&item.equipmentId===exercise.equipmentId&&item.loadConvention===exercise.loadConvention);
  const set=match?.sets.find(s=>s.type==='working'&&s.status==='completed'&&Number.isFinite(s.actualLoadKg));
  if(set) return {loadKg:set.actualLoadKg,executionId:run.id,date:run.performedDate,sets:match.sets.filter(s=>s.type==='working').map(s=>({loadKg:s.actualLoadKg,reps:s.actualReps,status:s.status}))};
 }
 return null;
}
export function suggestWarmup(exercise,referenceKg) {
 const percentages=exercise.warmupPlan.count===2?[.5,.7]:[.5];
 return percentages.map((percent,index)=>{
  const available=exercise.availableLoadsKg.filter(n=>Number.isFinite(n)&&n>=0&&n<=referenceKg*percent+1e-9&&n<referenceKg);
  return {id:`warmup-${index+1}`,percent,loadKg:available.length?Math.max(...available):null,targetReps:index===0?8:5,reason:available.length?null:'Não há carga compatível para a sugestão automática neste equipamento'};
 });
}
