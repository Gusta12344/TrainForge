const query=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 899px)');
const active=new Map();
const accordionGeneration=new WeakMap();
const nextAccordionGeneration=el=>{const next=(accordionGeneration.get(el)||0)+1;accordionGeneration.set(el,next);return next;};
function motionAllowed(){return !query.matches&&!document.hidden;}
export function cancelMotion(){for(const animation of active.values())animation.cancel();active.clear();}
query.addEventListener('change',event=>{if(event.matches)cancelMotion();});
mobile.addEventListener('change',cancelMotion);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelMotion();});
export function animate(el,keyframes,desktop,mobileDuration=desktop,options={}) {
 if(!el||!motionAllowed()||typeof el.animate!=='function')return null;
 active.get(el)?.cancel();
 const animation=el.animate(keyframes,{duration:mobile.matches?mobileDuration:desktop,easing:options.easing||'cubic-bezier(.22,1,.36,1)',delay:options.delay||0,fill:'none'});
 active.set(el,animation);
 animation.finished.catch(()=>{}).finally(()=>{if(active.get(el)===animation)active.delete(el);});
 return animation;
}
export function entrance(){
 const title=document.querySelector('.title-mask>span');
 animate(title,[{transform:'translateY(100%)',opacity:0},{transform:'translateY(0)',opacity:1}],520,340,{delay:mobile.matches?0:20});
 ['.week-section','.session-heading','.exercise-list-wrap','.exercise-detail'].forEach((selector,index)=>{
  animate(document.querySelector(selector),[{transform:`translateY(${mobile.matches?6:10}px)`,opacity:0},{transform:'translateY(0)',opacity:1}],340,240,{delay:(mobile.matches?[40,70,100,130]:[60,105,150,195])[index]});
 });
 animate(document.querySelector('.sidebar-top'),[{opacity:.7},{opacity:1}],220,0);
}
export function contextEntrance(kind,direction=1){
 const selector=kind==='week'?'#week-grid':kind==='detail'?'.exercise-detail':'.session-section,.rest-day';
 const distance=kind==='detail'?8:kind==='week'?12:16;
 document.querySelectorAll(selector).forEach(el=>animate(el,[{transform:`translate${kind==='detail'?'Y':'X'}(${direction*distance}px)`,opacity:0},{transform:'translate(0,0)',opacity:1}],kind==='detail'?260:kind==='week'?240:320,kind==='detail'?190:kind==='week'?180:220));
}
export function exerciseReveal(el,{resume=false}={}){
 if(!el)return;
 const fromHeight=resume?el.getBoundingClientRect().height:0;
 const generation=nextAccordionGeneration(el);
 const inner=el.querySelector('.exercise-detail-inner');
 const contentOpacity=resume?Number(getComputedStyle(inner).opacity):0;
 const contentTransform=resume?getComputedStyle(inner).transform:'translateY(-32px)';
 el.inert=false;el.removeAttribute('aria-hidden');el.style.height='';el.style.opacity='';el.style.overflow='';
 active.get(inner)?.cancel();inner.style.opacity='';inner.style.transform='';
 if(!motionAllowed()||typeof el.animate!=='function')return;
 const height=el.scrollHeight;
 el.style.overflow='hidden';
 const animation=animate(el,[{height:`${fromHeight}px`},{height:`${height}px`}],resume?500:820,resume?430:700,{easing:'cubic-bezier(.65,0,.3,1)'});
 inner.style.opacity=String(contentOpacity);inner.style.transform=contentTransform;
 const contentAnimation=animate(inner,[{opacity:contentOpacity,transform:contentTransform},{opacity:1,transform:'translateY(0)'}],resume?400:620,resume?350:560,{delay:resume?0:mobile.matches?65:90,easing:'cubic-bezier(.45,0,.25,1)'});
 contentAnimation?.finished.catch(()=>{}).finally(()=>{if(accordionGeneration.get(el)===generation){inner.style.opacity='';inner.style.transform='';}});
 if(!animation){el.style.overflow='';return;}
 const interrupt=()=>{animation.cancel();active.get(inner)?.cancel();inner.style.opacity='';inner.style.transform='';};
 el.addEventListener('pointerdown',interrupt,{once:true});
 el.addEventListener('focusin',interrupt,{once:true});
 animation.finished.catch(()=>{}).finally(()=>{
  el.removeEventListener('pointerdown',interrupt);el.removeEventListener('focusin',interrupt);
  if(accordionGeneration.get(el)===generation)el.style.overflow='';
 });
}
export function exerciseHide(el){
 if(!el)return;
 const height=el.getBoundingClientRect().height;
 const generation=nextAccordionGeneration(el);
 el.inert=true;el.setAttribute('aria-hidden','true');
 const inner=el.querySelector('.exercise-detail-inner');
 const contentOpacity=Number(getComputedStyle(inner).opacity),contentTransform=getComputedStyle(inner).transform;
 active.get(inner)?.cancel();inner.style.opacity='0';inner.style.transform='translateY(-32px)';
 if(!motionAllowed()||typeof el.animate!=='function'){el.remove();return;}
 el.style.height='0px';el.style.overflow='hidden';
 const animation=animate(el,[{height:`${height}px`},{height:'0px'}],740,640,{easing:'cubic-bezier(.65,0,.3,1)'});
 animate(inner,[{opacity:contentOpacity,transform:contentTransform},{opacity:0,transform:'translateY(-32px)'}],550,480,{easing:'cubic-bezier(.45,0,.25,1)'});
 if(!animation){el.remove();return;}
 animation.finished.catch(()=>{}).finally(()=>{if(accordionGeneration.get(el)===generation)el.remove();});
}
export function sidebarFlip(toggle){
 const main=document.querySelector('.workout-main');const before=main.getBoundingClientRect();toggle();const after=main.getBoundingClientRect();
 if(document.activeElement?.matches('input'))return;
 animate(main,[{transform:`translateX(${before.left-after.left}px)`},{transform:'translateX(0)'}],300,0,{easing:'cubic-bezier(.2,.8,.2,1)'});
}
export function checkFeedback(row){animate(row?.querySelector('.set-status'),[{transform:'scale(.9)',opacity:.6},{transform:'scale(1)',opacity:1}],160,120,{easing:'cubic-bezier(.2,0,0,1)'});}
