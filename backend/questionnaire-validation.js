import { initialAnswers, options, stepQuestions, applies, projectAnswers, validateStep, parseNumber } from '../frontend/src/js/questionario/model.js';

const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (value, max = 160) => typeof value === 'string' && value.length <= max;
const validNumber = value => string(value, 20) && Number.isFinite(parseNumber(value)) && parseNumber(value) > 0 && parseNumber(value) <= 10_000;
const day = value => typeof value === 'string' && /^[0-6]$/.test(value);
const unique = values => new Set(values).size === values.length;
const subset = (value, allowed, max = 20) => Array.isArray(value) && value.length <= max && unique(value) && value.every(item => allowed.includes(item));
const keysOnly = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const optionValues = key => options[key]?.map(option => option[0]) ?? [];
const places = ['gym', 'home', 'club', 'outside'];
const equipment = ['dumbbells', 'barbell', 'bench', 'rack', 'bands', 'kettlebell', 'pullup', 'cables', 'machines', 'none', 'unknown'];
const intensity = ['low', 'medium', 'high'];

function validEvents(events, kind) {
  if (!Array.isArray(events) || events.length > 14) return false;
  return events.every(event => {
    if (!plain(event) || !string(event.id, 40) || !/^[0-9a-f-]{36}$/i.test(event.id)) return false;
    if (!validNumber(event.minutes) || !intensity.includes(event.intensity)) return false;
    if (kind === 'sportEvents') return keysOnly(event, ['id','activity','type','day','minutes','intensity'])
      && ['volleyball','other'].includes(event.activity) && ['training','game'].includes(event.type) && day(event.day);
    return keysOnly(event, ['id','name','days','minutes','intensity'])
      && string(event.name) && event.name.trim().length > 0 && subset(event.days, optionValues('Q15'), 7) && event.days.length > 0;
  });
}

export function validateQuestionnaire(body) {
  if (!plain(body)) return { error: 'Formato de respostas inválido.' };
  const permitted = [...stepQuestions.flat(), 'otherSport','sportEvents','otherEvents','variable','week','times','timing','locations','gear'];
  if (!keysOnly(body, permitted)) return { error: 'O questionário contém campos desconhecidos.' };
  const answers = { ...initialAnswers(), ...body };
  if (!plain(answers.times) || !plain(answers.timing) || !plain(answers.locations) || !plain(answers.gear)) return { error: 'Dados de disponibilidade inválidos.' };
  if (!Array.isArray(answers.Q04) || !Array.isArray(answers.Q15) || !Array.isArray(answers.Q24)) return { error: 'Seleções inválidas.' };
  if (!subset(answers.Q04, optionValues('Q04'), 2) || !subset(answers.Q15, optionValues('Q15'), 7) || !subset(answers.Q24, optionValues('Q24'), 7)) return { error: 'Seleções inválidas.' };
  if (answers.Q04.includes('none') && answers.Q04.length > 1 || answers.Q24.some(value => ['none','unknown'].includes(value)) && answers.Q24.length > 1) return { error: 'Seleções incompatíveis.' };
  for (const question of stepQuestions.flat()) {
    if (!applies(question, answers) || body[question] === undefined || ['Q04','Q05','Q06','Q07','Q13','Q15','Q16','Q17','Q20','Q23','Q24'].includes(question)) continue;
    if (!optionValues(question).includes(body[question])) return { error: `Resposta inválida em ${question}.` };
  }
  if (['Q05','Q06','Q07','Q16'].some(key => body[key] !== undefined && !validNumber(body[key]))) return { error: 'Dados numéricos inválidos.' };
  if (body.otherSport !== undefined && !string(body.otherSport)) return { error: 'Nome do esporte inválido.' };
  if (body.variable !== undefined && typeof body.variable !== 'boolean') return { error: 'Rotina esportiva inválida.' };
  if (body.week !== undefined && (!string(body.week, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(body.week))) return { error: 'Data inválida.' };
  if (body.sportEvents !== undefined && !validEvents(body.sportEvents, 'sportEvents')) return { error: 'Compromissos esportivos inválidos.' };
  if (body.otherEvents !== undefined && !validEvents(body.otherEvents, 'otherEvents')) return { error: 'Outras atividades inválidas.' };
  if (!keysOnly(body.times ?? {}, optionValues('Q15')) || !Object.values(body.times ?? {}).every(validNumber)) return { error: 'Tempos disponíveis inválidos.' };
  if (!keysOnly(body.timing ?? {}, optionValues('Q15')) || !Object.values(body.timing ?? {}).every(value => ['before','after','unknown'].includes(value))) return { error: 'Horários inválidos.' };
  if (!keysOnly(body.locations ?? {}, optionValues('Q15')) || !Object.values(body.locations ?? {}).every(value => places.includes(value))) return { error: 'Locais inválidos.' };
  if (!keysOnly(body.gear ?? {}, places) || !Object.values(body.gear ?? {}).every(value => subset(value, equipment, equipment.length))) return { error: 'Equipamentos inválidos.' };
  if (Object.values(body.gear ?? {}).some(value => (value.includes('none') || value.includes('unknown')) && value.length > 1)) return { error: 'Equipamentos incompatíveis.' };
  const invalidStep = [0,1,2,3,4,5].find(step => Object.keys(validateStep(answers, step)).length);
  if (invalidStep !== undefined) return { error: 'Revise as respostas antes de salvar.', step: invalidStep, details: validateStep(answers, invalidStep) };
  const canonical = projectAnswers(answers);
  if (Object.keys(body).some(key => !(key in canonical))) return { error: 'Há respostas de perguntas que não se aplicam ao perfil atual.' };
  return { answers: canonical };
}
