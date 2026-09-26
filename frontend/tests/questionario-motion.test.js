import test from 'node:test';
import assert from 'node:assert/strict';

// Contratos de coordenação; não simulam frames, layout, browser ou desempenho.
test('movimento mantém o alvo do clique, ignora limpeza antiga e respeita movimento reduzido', async () => {
 const media={matches:false,addEventListener(){}};
 const listeners=new Map();
 const frames=[];
 globalThis.matchMedia=()=>media;
 globalThis.innerWidth=1440;
 globalThis.window={addEventListener(){}};
 globalThis.document={hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn)};
 globalThis.requestAnimationFrame=fn=>frames.push(fn);
 globalThis.Element=class {
  attrs=new Map(); animations=[];
  setAttribute(k,v){this.attrs.set(k,v);}
  removeAttribute(k){this.attrs.delete(k);}
  contains(target){return target===this;}
  animate(){
   let resolve,reject;
   const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
   const result={finished,paused:false,cancelled:false,pause(){this.paused=true;},cancel(){this.cancelled=true;reject(new Error('cancelled'));},finish:resolve};
   this.animations.push(result);return result;
  }
 };
 const {animate,initMotion,stopMotion}=await import('../src/js/questionario/motion.js');
 initMotion();
 const element=new Element();
 const first=animate(element,[{opacity:0},{opacity:1}],420);
 listeners.get('pointerdown')({target:element});
 assert.equal(first.paused,true);
 assert.equal(first.cancelled,false,'o controle não salta antes de completar o clique');
 listeners.get('pointerup')();
 assert.equal(first.cancelled,false);
 frames.shift()();
 assert.equal(first.cancelled,true);

 const previous=animate(element,[{opacity:0},{opacity:1}],420);
 const current=animate(element,[{opacity:.5},{opacity:1}],420);
 await Promise.resolve();
 assert.equal(previous.cancelled,true);
 assert.equal(current.cancelled,false);
 assert.equal(element.attrs.has('data-motion-active'),true,'limpeza antiga não remove o movimento atual');
 current.finish();await Promise.resolve();
 assert.equal(element.attrs.has('data-motion-active'),false);

 media.matches=true;
 assert.equal(animate(element,[{opacity:0},{opacity:1}],420),undefined);
 media.matches=false;
 const active=animate(element,[{opacity:0},{opacity:1}],420);
 stopMotion();await Promise.resolve();
 assert.equal(active.cancelled,true);
 assert.equal(element.attrs.has('data-motion-active'),false);
});
