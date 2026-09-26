// Respostas em memória. Persistência e contrato da API ainda não integrados.
export const steps = ['Objetivo', 'Perfil e experiência', 'Rotina esportiva', 'Disponibilidade', 'Local e equipamentos', 'Restrições', 'Revisão das respostas'];
export const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
export const places = [['gym', 'Academia'], ['home', 'Em casa'], ['club', 'Clube, escola ou equipe'], ['outside', 'Área externa']];
export const equipment = [['dumbbells', 'Halteres'], ['barbell', 'Barras e anilhas'], ['bench', 'Banco de exercícios'], ['rack', 'Suporte para agachamento'], ['bands', 'Elásticos'], ['kettlebell', 'Kettlebell'], ['pullup', 'Barra fixa'], ['cables', 'Polias/cabos'], ['machines', 'Máquinas de musculação'], ['none', 'Nenhum desses; apenas peso do corpo'], ['unknown', 'Não sei identificar os equipamentos']];
export const options = {
 Q01: [['hypertrophy', 'Hipertrofia', 'Desenvolvimento muscular', 'dumbbell'], ['strength', 'Força', 'Desenvolvimento de força', 'weight'], ['sport', 'Preparação para esporte', 'Treino voltado à modalidade', 'activity']],
 Q02: [['volleyball', 'Vôlei', '', 'volleyball']],
 Q03: [['none', 'Não, focar no esporte'], ['hypertrophy', 'Sim, hipertrofia'], ['strength', 'Sim, força']],
 Q04: [['none', 'Não tenho preferência'], ...['Peito', 'Costas', 'Ombros', 'Braços', 'Coxas', 'Glúteos', 'Panturrilhas'].map(x => [x, x])],
 Q08: [['never', 'Nunca pratiquei'], ['under6', 'Menos de 6 meses'], ['6to12', 'De 6 meses a menos de 1 ano'], ['1to2', 'De 1 ano a menos de 2 anos'], ['2plus', '2 anos ou mais']],
 Q09: [['notstarted', 'Ainda não comecei'], ['regular', 'Estou treinando regularmente'], ['irregular', 'Treino de forma irregular'], ['paused', 'Estou voltando depois de uma pausa']],
 Q10: [['under1', 'Menos de 1 mês'], ['1to3', 'De 1 a menos de 3 meses'], ['3to6', 'De 3 a menos de 6 meses'], ['6plus', '6 meses ou mais']],
 Q11: [['none', 'Não'], ['volleyball', 'Sim, vôlei'], ['other', 'Sim, outro esporte'], ['both', 'Sim, vôlei e outro esporte']],
 Q12: [['starting', 'Ainda vou começar'], ['beginning', 'Estou começando a praticar'], ['leisure', 'Jogo por lazer'], ['training', 'Treinos organizados, sem competições'], ['competition', 'Treinos e competições']],
 Q14: [['no', 'Não'], ['yes', 'Sim']],
 Q15: days.map((d, i) => [String(i), d]),
 Q18: [['separate', 'Prefiro dias diferentes'], ['same', 'Posso fazer no mesmo dia']],
 Q19: [...places, ['multiple', 'Mais de um local']],
 Q21: [['both', 'Permite deslocamentos e saltos'], ['jumps', 'Permite saltos no lugar'], ['none', 'Não permite saltos nem deslocamentos'], ['unknown', 'Não sei informar']],
 Q22: [['none', 'Não tenho restrição conhecida'], ['yes', 'Sim'], ['unsure', 'Tenho dúvidas sobre alguma limitação']],
 Q24: [...['Ombros', 'Cotovelos, punhos ou mãos', 'Coluna/costas', 'Quadris', 'Joelhos', 'Tornozelos ou pés', 'Outra região'].map(x => [x, x]), ['none', 'Não se refere a uma região específica'], ['unknown', 'Não sei informar']],
};
export const questions = {
 Q01: 'Qual é seu objetivo principal?', Q02: 'Para qual esporte você quer se preparar?', Q03: 'Quer combinar com outro objetivo?', Q04: 'Atenção especial a alguma região muscular?',
 Q05: 'Qual é sua idade?', Q06: 'Qual é sua altura?', Q07: 'Qual é seu peso atual?', Q08: 'Quanto tempo de experiência você tem com musculação ou treinamento de força?', Q09: 'Como está sua prática de treinamento de força atualmente?', Q10: 'Há quanto tempo você está sem treinar regularmente?',
 Q11: 'Você pratica algum esporte atualmente?', Q12: 'Como é sua participação no vôlei?', Q13: 'Em quais dias você costuma ter treinos ou jogos?', Q14: 'Você faz outro treino físico que pretende manter?',
 Q15: 'Em quais dias você pode realizar os treinos do programa?', Q16: 'Quantos dias por semana pretende dedicar ao programa?', Q17: 'Quanto tempo você tem disponível em cada dia?', Q18: 'Pode treinar no mesmo dia de um treino ou jogo esportivo?',
 Q19: 'Onde você realizará os treinos do programa?', Q20: 'Quais equipamentos estão disponíveis nesse local?', Q21: 'O espaço permite deslocamentos ou saltos?', Q22: 'Você possui alguma restrição para exercícios já identificada por um profissional?', Q23: 'Quais orientações ou restrições você recebeu?', Q24: 'A quais regiões essas restrições se referem?',
};
export const stepQuestions = [['Q01', 'Q02', 'Q03', 'Q04'], ['Q05', 'Q06', 'Q07', 'Q08', 'Q09', 'Q10'], ['Q11', 'Q12', 'Q13', 'Q14'], ['Q15', 'Q16', 'Q17', 'Q18'], ['Q19', 'Q20', 'Q21'], ['Q22', 'Q23', 'Q24']];
export const initialAnswers = () => ({ Q04: [], Q15: [], Q24: [], sportEvents: [], otherEvents: [], times: {}, timing: {}, locations: {}, gear: {}, space: {} });
export const hasSport = a => Boolean(a.Q11 && a.Q11 !== 'none');
export const hasVolley = a => ['volleyball', 'both'].includes(a.Q11);
export const selectedDays = a => [...a.Q15].sort();
export const activePlaces = a => a.Q19 === 'multiple' ? [...new Set(selectedDays(a).map(d => a.locations[d]).filter(Boolean))] : a.Q19 ? [a.Q19] : [];
export const overlaps = a => hasSport(a) ? selectedDays(a).filter(d => a.sportEvents.some(e => e.day === d)) : [];
export function applies(q, a) {
 if (['Q02', 'Q03'].includes(q)) return a.Q01 === 'sport';
 if (q === 'Q04') return a.Q01 === 'hypertrophy' || a.Q01 === 'sport' && a.Q03 === 'hypertrophy';
 if (q === 'Q10') return a.Q09 === 'paused';
 if (q === 'Q12') return a.Q01 === 'sport' || hasVolley(a);
 if (['Q13', 'Q18'].includes(q)) return hasSport(a);
 // Catálogo ainda não confirma exercícios com saltos: não pressupor aplicabilidade.
 if (q === 'Q21') return false;
 if (['Q23', 'Q24'].includes(q)) return a.Q22 === 'yes';
 return true;
}
export function toggleMultiple(previous = [], value, exclusive = []) {
 if (previous.includes(value)) return previous.filter(v => v !== value);
 if (exclusive.includes(value)) return [value];
 return [...previous.filter(v => !exclusive.includes(v)), value];
}
export const parseNumber = value => /^\d+(?:[.,]\d+)?$/.test(String(value).trim()) ? Number(String(value).trim().replace(',', '.')) : NaN;
export const label = (q, value) => options[q]?.find(o => o[0] === value)?.[1] ?? value ?? 'Não informado';
const filled = v => typeof v === 'string' ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : v != null;
export function validateStep(a, step) {
 const errors = {};
 const fail = (key, message) => { errors[key] = message; };
 if (step === 0 && applies('Q04', a) && a.Q04.length > 2) fail('Q04', 'Escolha até duas regiões musculares.');
 for (const q of stepQuestions[step] ?? []) {
  if (!applies(q, a) || ['Q03','Q13','Q17','Q20','Q21','Q23'].includes(q)) continue;
  if (!filled(a[q])) fail(q, 'Responda esta pergunta para continuar.');
 }
 if (step === 1) {
  for (const q of ['Q05','Q06','Q07']) {
   const n = parseNumber(a[q]);
   if (!Number.isFinite(n) || n <= 0 || q === 'Q05' && !Number.isInteger(n)) fail(q, q === 'Q05' ? 'Informe a idade em anos completos, maior que zero.' : 'Informe um número maior que zero. Você pode usar vírgula.');
  }
  if (a.Q08 === 'never' && a.Q09 && a.Q09 !== 'notstarted' || a.Q08 && a.Q08 !== 'never' && a.Q09 === 'notstarted') fail('Q09', 'A experiência e a situação atual não combinam. Confira as duas respostas.');
 }
 if (step === 2) {
  if (['other','both'].includes(a.Q11) && !filled(a.otherSport)) fail('Q11', 'Informe o nome do outro esporte.');
  if (applies('Q12',a) && a.Q12 && (hasVolley(a) === (a.Q12 === 'starting'))) fail('Q12', 'Confira sua participação: “Ainda vou começar” corresponde a quem ainda não pratica vôlei.');
  if (hasSport(a)) {
   if (!a.sportEvents.length) fail('Q13','Adicione pelo menos um treino ou jogo à semana de referência.');
   const allowed = [hasVolley(a) && 'volleyball', ['other','both'].includes(a.Q11) && 'other'].filter(Boolean);
   if (a.sportEvents.some(e => !allowed.includes(e.activity) || !e.type || !filled(e.day) || !e.intensity || !(parseNumber(e.minutes) > 0))) fail('Q13','Complete atividade, tipo, dia, duração e exigência de cada compromisso.');
   if (a.variable && !a.week) fail('Q13','Informe a data de início da semana de referência.');
  }
  if (a.Q14 === 'yes' && (!a.otherEvents.length || a.otherEvents.some(e => !filled(e.name) || !e.days?.length || !e.intensity || !(parseNumber(e.minutes)>0)))) fail('Q14','Complete nome, dias, duração e exigência das atividades que pretende manter.');
 }
 if (step === 3) {
  if (!Number.isInteger(parseNumber(a.Q16)) || parseNumber(a.Q16) < 1 || parseNumber(a.Q16) > a.Q15.length) fail('Q16',`Você selecionou ${a.Q15.length} dias disponíveis. Informe uma quantidade inteira entre 1 e esse total.`);
  if (selectedDays(a).some(d => !(parseNumber(a.times[d])>0))) fail('Q17','Informe o tempo disponível, em minutos, para cada dia selecionado.');
  if (a.Q18 === 'same' && overlaps(a).some(d=>!a.timing[d])) fail('Q18','Informe o horário possível em cada dia que coincide com seu esporte.');
  if (hasSport(a) && a.Q18 === 'separate' && selectedDays(a).length - overlaps(a).length < parseNumber(a.Q16)) fail('Q18','Não há dias separados suficientes para a quantidade desejada. Ajuste dias, sessões ou a possibilidade de treinar no mesmo dia.');
 }
 if (step === 4) {
  if (a.Q19 === 'multiple' && (selectedDays(a).some(d => !a.locations[d]) || activePlaces(a).length < 2)) fail('Q19','Associe cada dia a um local e escolha pelo menos dois locais diferentes.');
  if (activePlaces(a).some(p => !a.gear[p]?.length)) fail('Q20','Informe os equipamentos de cada local, inclusive quando não souber identificá-los.');
 }
 return errors;
}
// Somente respostas ativas: rascunhos condicionais permanecem no estado, fora da revisão.
export function projectAnswers(a) {
 const result = {};
 for (const q of stepQuestions.flat()) if (applies(q,a) && a[q] !== undefined) result[q] = structuredClone(a[q]);
 if (['other','both'].includes(a.Q11)) result.otherSport = a.otherSport;
 if (hasSport(a)) { result.sportEvents=structuredClone(a.sportEvents); result.variable=Boolean(a.variable); if(a.variable) result.week=a.week; }
 if(a.Q14==='yes') result.otherEvents=structuredClone(a.otherEvents);
 result.times=Object.fromEntries(selectedDays(a).map(d=>[d,a.times[d]]));
 if(hasSport(a) && a.Q18==='same') result.timing=Object.fromEntries(overlaps(a).map(d=>[d,a.timing[d]]));
 if(a.Q19==='multiple') result.locations=Object.fromEntries(selectedDays(a).map(d=>[d,a.locations[d]]));
 result.gear=Object.fromEntries(activePlaces(a).map(p=>[p,structuredClone(a.gear[p] ?? [])]));
 return result;
}
