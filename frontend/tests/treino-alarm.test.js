import test from 'node:test';
import assert from 'node:assert/strict';
import { createRestAlarm } from '../src/js/treino/alarm.js';

test('alarme dispara ao zerar, repete e para ao silenciar, estender ou encerrar',()=>{
 const events=[];
 let tick;
 const alarm=createRestAlarm({signal:()=>events.push('signal'),silence:()=>events.push('silence'),schedule:callback=>{tick=callback;return 1;},unschedule:()=>{tick=null;events.push('unschedule');}});
 alarm.update('rest-1',false);
 assert.equal(events.includes('signal'),false);
 alarm.update('rest-1',true);
 assert.equal(events.filter(event=>event==='signal').length,1);
 alarm.update('rest-1',true);
 tick();
 assert.equal(events.filter(event=>event==='signal').length,2);
 alarm.setMuted(true);
 assert.equal(tick,null);
 assert.equal(events.at(-1),'silence');
 alarm.update('rest-1',true);
 assert.equal(events.filter(event=>event==='signal').length,2);
 alarm.setMuted(false);
 assert.equal(events.filter(event=>event==='signal').length,3);
 alarm.update('rest-1',false);
 assert.equal(tick,null);
 alarm.update(null,false);
 assert.equal(events.filter(event=>event==='signal').length,3);
});

test('um novo descanso pode tocar depois do anterior e respeita a preferência de silêncio',()=>{
 let signals=0;
 const alarm=createRestAlarm({signal:()=>{signals++;},silence:()=>{},schedule:()=>1,unschedule:()=>{}});
 alarm.update('rest-1',true);
 alarm.update('rest-2',true);
 assert.equal(signals,2);
 alarm.setMuted(true);
 alarm.update('rest-3',true);
 assert.equal(signals,2);
});
