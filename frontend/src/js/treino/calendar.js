/** Dates in this module are calendar dates in the device's local timezone. */
export function localDateKey(date) {
 const pad=n=>String(n).padStart(2,'0');
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
export function fromDateKey(key) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('Data inválida');
 const [y,m,d]=key.split('-').map(Number);
 const date=new Date(y,m-1,d,12);
 if(localDateKey(date)!==key) throw new Error('Data inválida');
 return date;
}
export function shiftLocalDate(key,days) {
 const date=fromDateKey(key); date.setDate(date.getDate()+days); return localDateKey(date);
}
export function weekDates(dateOrKey) {
 const date=typeof dateOrKey==='string'?fromDateKey(dateOrKey):new Date(dateOrKey);
 const monday=shiftLocalDate(localDateKey(date),-((date.getDay()+6)%7));
 return Array.from({length:7},(_,i)=>shiftLocalDate(monday,i));
}
export function weekdayNumber(key) { return ((fromDateKey(key).getDay()+6)%7)+1; }
export function sessionForDate(program,key) { const id=program.weeklySchedule[weekdayNumber(key)]; return program.sessions.find(s=>s.id===id)||null; }
export function formatDate(key,options={day:'numeric',month:'long',year:'numeric'}) { return new Intl.DateTimeFormat('pt-BR',options).format(fromDateKey(key)); }
