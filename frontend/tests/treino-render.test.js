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
