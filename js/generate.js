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

function loadFile(url,callback){
  PizZipUtils.getBinaryContent(url,callback);
}

function generate(syllabusTemplate, syllabusData) {
  console.log(syllabusData);
  loadFile(syllabusTemplate, function(error,content){
      if (error) { throw error };
      var zip = new PizZip(content);
      var doc=new window.docxtemplater().loadZip(zip)
      doc.setOptions({linebreaks: true})
      doc.setData(syllabusData);
      try {
          doc.render()
      }
      catch (error) {
          var e = {
              message: error.message,
              name: error.name,
              stack: error.stack,
              properties: error.properties,
          }
          console.log(JSON.stringify({error: e}));
          throw error;
      }
      var out=doc.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      var outFilename = "Syllabus";
      [syllabusData.title, syllabusData.term].forEach(s =>{
        if (s != "") outFilename += (" " + s) ;
      });
      outFilename += ".docx"
      saveAs(out, outFilename)
  })
}

$("#syllabusForm").on( "submit", event => {
  event.preventDefault();
  var sd = $("#syllabusForm").serializeJSON();
  sd.days = getDaysForTerm(sd.term, sd.weekdays);
  sd.hasModule = sd.module != "";
  sd.hasRoom = sd.room != "";
  sd.hasTime = sd.time != "";
  sd.hasInfo = sd.time || sd.room;
  sd.title = sd.title ? sd.title : "[Titel]";
  sd.name = sd.name ? sd.name : "[Name]";
  sd.department = sd.presetDepartment == "custom" ? sd.customDepartment : departments[sd.presetDepartment].display;
  sd.hasDepartment = sd.department !="";
  generate("syllabus_template.docx", sd);
});

