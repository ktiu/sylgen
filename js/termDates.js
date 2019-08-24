function buildUTCDate(string) {
  return new Date(string + 'T00:00:00Z');
} 

function addDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() +1));
}

function daysInRange(startDateString, endDateString) {
  startDate = buildUTCDate(startDateString);
  endDate = buildUTCDate(endDateString)
  var days = [];
  for(var d=startDate; d<=endDate; d=addDay(d)) {
    days.push(d);
  }
  return days;
}

function getDaysForTerm(termName, weekdays) {
  if(!weekdays) return [];
  var dayInts = weekdays.map(parseInt);
  term = termData.filter(t => t.name === termName)[0];
  var days = daysInRange(term.start, term.end);
  var offDays = term.offRanges.map(offRange => daysInRange(offRange.start, offRange.end))
  offDays = offDays.flat().concat(term.offDays.map(buildUTCDate));
  offTime = offDays.map(d => d.getTime());
  days = days.filter(d => {
    var t = d.getTime();
    return !offTime.includes(t);
  });
  days = days.filter(d => dayInts.includes(d.getUTCDay()));
  return days.map(d => {return {date: d.toLocaleString('de-DE', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' })};});
}
