import test from 'node:test';
import assert from 'node:assert/strict';
import * as render from '../src/js/treino/render.js';

test('série concluída exibe o selo e a ação de desfazer imediatamente',()=>{
 assert.equal(typeof render.renderCompletedSetActions,'function');
 const html=render.renderCompletedSetActions('warmup-1');
 assert.match(html, /class="set-status"[^>]*>.*Concluído/);
 assert.match(html, /data-undo="warmup-1"/);
 assert.doesNotMatch(html, /class="set-button"/);
});

test('descanso concluído mostra aviso e oferece silêncio, mais tempo e encerramento',()=>{
 const rest={suggestedSeconds:60,extensionSeconds:0};
 const html=render.renderRest(rest,0,'Supino reto');
 assert.match(html,/Tempo concluído/);
 assert.match(html,/id="toggle-rest-mute"/);
 assert.match(html,/id="extend-rest"/);
 assert.match(html,/id="end-rest"/);
});
