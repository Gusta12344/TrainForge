export function createRestAlarm({signal,silence,schedule=callback=>setInterval(callback,1800),unschedule=clearInterval}) {
 let restId=null,expired=false,muted=false,interval=null;
 function stop(){
  if(interval===null)return;
  unschedule(interval);interval=null;silence();
 }
 function start(){
  if(!restId||!expired||muted||interval!==null)return;
  signal();interval=schedule(signal);
 }
 return {
  get muted(){return muted;},
  update(nextRestId,isExpired){
   if(nextRestId!==restId){stop();restId=nextRestId;}
   expired=Boolean(nextRestId&&isExpired);
   if(expired)start();else stop();
  },
  setMuted(value){muted=Boolean(value);if(muted)stop();else start();return muted;},
 };
}

export function createBrowserRestSignal(){
 let context=null;
 const oscillators=new Set();
 function unlock(){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return;
  try {
   if(!context)context=new AudioContextClass();
   if(context.state==='suspended')void context.resume().catch(()=>{});
  } catch {/* Audio is optional when the browser blocks it. */}
 }
 function tone(at){
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type='sine';oscillator.frequency.setValueAtTime(880,at);
  gain.gain.setValueAtTime(0.001,at);
  gain.gain.exponentialRampToValueAtTime(0.16,at+0.02);
  gain.gain.exponentialRampToValueAtTime(0.001,at+0.19);
  oscillator.connect(gain);gain.connect(context.destination);
  oscillators.add(oscillator);
  oscillator.onended=()=>{oscillators.delete(oscillator);oscillator.disconnect();gain.disconnect();};
  oscillator.start(at);oscillator.stop(at+0.2);
 }
 function signal(){
  unlock();
  try{if(context?.state==='running'){const at=context.currentTime;tone(at);tone(at+0.27);}}catch{/* Keep the visual notice and vibration available. */}
  try{navigator.vibrate?.([180,100,180]);}catch{/* Vibration may be unavailable. */}
 }
 function silence(){
  for(const oscillator of oscillators){try{oscillator.stop();}catch{/* Already stopped. */}}
  try{navigator.vibrate?.(0);}catch{/* Vibration may be unavailable. */}
 }
 return {unlock,signal,silence};
}
