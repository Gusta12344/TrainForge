import test from 'node:test';
import assert from 'node:assert/strict';
import { initialAnswers, applies, projectAnswers, validateStep, toggleMultiple, parseNumber } from '../src/js/questionario/model.js';

test('complemento esportivo é opcional e vazio não significa ausência declarada',()=>{
 const a={...initialAnswers(),Q01:'sport',Q02:'volleyball'};
 assert.deepEqual(validateStep(a,0),{});
 assert.equal('Q03' in projectAnswers(a),false);
 assert.equal(applies('Q04',a),false);
 a.Q03='none';assert.equal(projectAnswers(a).Q03,'none');
 a.Q03='hypertrophy';assert.ok(validateStep(a,0).Q04);
});

test('trocar objetivo preserva rascunho e remove respostas inaplicáveis da projeção',()=>{
 const a={...initialAnswers(),Q01:'sport',Q02:'volleyball',Q03:'hypertrophy',Q04:['Peito'],Q11:'none',Q12:'starting'};
 assert.equal(applies('Q04',a),true);
 a.Q01='strength';
 const p=projectAnswers(a);
 for(const q of ['Q02','Q03','Q04','Q12']) assert.equal(q in p,false);
 assert.deepEqual(a.Q04,['Peito']);
 a.Q01='sport'; assert.deepEqual(projectAnswers(a).Q04,['Peito']);
});
test('objetivo esportivo não presume prática e prática não depende de objetivo',()=>{
 const a={...initialAnswers(),Q01:'sport',Q11:'none',Q12:'starting',Q14:'no'};
 assert.equal(applies('Q13',a),false);assert.equal(applies('Q18',a),false);
 a.Q01='hypertrophy';a.Q11='volleyball';
 assert.equal(applies('Q12',a),true);assert.equal(applies('Q13',a),true);
 assert.ok(validateStep(a,2).Q12);
});
test('decimal brasileiro, faixa clínica não inventada e experiência coerente',()=>{
 assert.equal(parseNumber('72,5'),72.5);assert.ok(Number.isNaN(parseNumber('72abc')));
 const a={...initialAnswers(),Q05:'25',Q06:'175',Q07:'72,5',Q08:'never',Q09:'notstarted'};
 assert.deepEqual(validateStep(a,1),{});
 a.Q09='paused';assert.ok(validateStep(a,1).Q09);assert.ok(validateStep(a,1).Q10);
});
test('nenhuma preferência é exclusiva e limite aprovado é duas regiões',()=>{
 assert.deepEqual(toggleMultiple(['none'],'Peito',['none']),['Peito']);
 assert.deepEqual(toggleMultiple(['Peito','Costas'],'none',['none']),['none']);
 const a={...initialAnswers(),Q01:'hypertrophy',Q04:['Peito','Costas','Braços']};assert.ok(validateStep(a,0).Q04);
});
test('dias reduzidos invalidam sessões sem descartar tempos guardados',()=>{
 const a={...initialAnswers(),Q15:['0','2','4'],Q16:'3',times:{0:'45',2:'50',4:'60'}};
 assert.deepEqual(validateStep(a,3),{});
 a.Q15=['0'];assert.ok(validateStep(a,3).Q16);
 assert.deepEqual(projectAnswers(a).times,{'0':'45'});assert.equal(a.times[4],'60');
});
test('compromissos incompletos e conflito de dias são explicados',()=>{
 const a={...initialAnswers(),Q11:'volleyball',Q12:'leisure',Q14:'no',sportEvents:[{id:'one',activity:'volleyball',type:'training',day:'0',minutes:'60',intensity:'medium'}],Q15:['0','2'],Q16:'2',Q18:'separate',times:{0:'45',2:'45'}};
 assert.deepEqual(validateStep(a,2),{});assert.ok(validateStep(a,3).Q18);
 a.Q18='same';assert.ok(validateStep(a,3).Q18);
 a.timing[0]='unknown';assert.deepEqual(validateStep(a,3),{});
 a.sportEvents[0].minutes='';assert.ok(validateStep(a,2).Q13);
});
test('locais por dia mantêm equipamentos separados e excluem locais inativos',()=>{
 const a={...initialAnswers(),Q15:['0','2'],Q19:'multiple',locations:{0:'gym',2:'home'},gear:{gym:['barbell'],home:['none'],club:['rack']}};
 assert.deepEqual(validateStep(a,4),{});
 assert.deepEqual(Object.keys(projectAnswers(a).gear),['gym','home']);
 a.Q19='home';assert.deepEqual(projectAnswers(a).gear,{home:['none']});assert.equal('locations' in projectAnswers(a),false);
});
test('restrições e pausa ocultas ficam fora da revisão; catálogo não é presumido',()=>{
 const a={...initialAnswers(),Q09:'regular',Q10:'6plus',Q22:'none',Q24:['Joelhos'],Q21:'both'};
 const p=projectAnswers(a);for(const q of ['Q10','Q24','Q21']) assert.equal(q in p,false);
 a.Q22='yes';assert.equal(applies('Q23',a),true);
 assert.deepEqual(projectAnswers(a).Q24,['Joelhos']);
});
