export function startRest(origin,seconds,now=new Date()) {
 const ms=now.getTime();
 return {...origin,startedAt:now.toISOString(),endsAt:new Date(ms+seconds*1000).toISOString(),suggestedSeconds:seconds,extensionSeconds:0,status:'active'};
}
export function remainingSeconds(rest,now=new Date()) { return rest?.status==='active'?Math.max(0,Math.ceil((Date.parse(rest.endsAt)-now.getTime())/1000)):0; }
export function extendRest(rest,seconds,now=new Date()) {
 if(rest?.status!=='active') throw new Error('Descanso indisponível');
 return {...rest,endsAt:new Date(Math.max(Date.parse(rest.endsAt),now.getTime())+seconds*1000).toISOString(),extensionSeconds:rest.extensionSeconds+seconds};
}
export function endRest(rest,now=new Date()) { return rest?{...rest,status:'ended',endedAt:now.toISOString()}:null; }
