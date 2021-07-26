function addDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() +1));
}

function daysInRange(startDate, endDate) {
  var days = [];
  for(var d=startDate; d<=endDate; d=addDay(d)) {
    days.push(d);
  }
  return days;
}

function getDaysForTerm(termIndex, weekdays, text) {
  if(!weekdays) return [];
  var dayInts = weekdays.map(Number);
  var term = terms[termIndex];
  var days = daysInRange(term.start, term.end);
  var offDays = [];
  if ('offRanges' in term) {
    offDays = offDays.concat(term.offRanges.map(offRange => daysInRange(offRange.start, offRange.end)));
  }
  if ('offDays' in term) {
    offDays = offDays.concat(term.offDays);
  }
  offTime = offDays.flat().map(d => d.getTime());
  days = days.filter(d => {
    var t = d.getTime();
    return !offTime.includes(t);
  });
  days = days.filter(d => dayInts.includes(d.getUTCDay()));
  return days.map((d, i) => {
    return {
      string: ( $("#numberSessions").is(":checked") ?  i+1 + ") " : "")  + d.toLocaleString('de-DE', {
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }),
      text: text 
    }
  });
}

function loadFile(url,callback){
  PizZipUtils.getBinaryContent(url,callback);
}

function generate(syllabusTemplate, syllabusData) {
  loadFile(syllabusTemplate, function(error, content){
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

$("#forget").click( function() {
  Cookies.remove('formData');
  location.reload(true);
});


$("#syllabusForm").on( "submit", event => {
  event.preventDefault();
  var sd = $("#syllabusForm").serializeJSON();
  if(sd.remember) {
    Cookies.set('formData', sd, { expires: (365 * 10) });
  }
  sd.hasModule = sd.module != "";
  sd.hasRoom = sd.room != "";
  sd.hasTime = sd.time != "";
  sd.hasWebsite = sd.website != "";
  sd.hasEmail = sd.email != "";
  sd.hasHours = sd.hours != "";
  sd.hasOffice = sd.office != "";
  sd.hasInfo = sd.time || sd.room;
  sd.title = sd.title ? sd.title : "[Titel]";
  sd.name = sd.name ? sd.name : "[Name]";
  sd.department = sd.presetDepartment == "custom" ? sd.customDepartment : departments[sd.presetDepartment].display;
  sd.hasDepartment = sd.department !="";
  sd.sections = [];
  if(sd.showSections.includes("session")){
    sessionDetails = sections.find(s => s.id === "session");
    sd.showSessions = true
    sd.sessionsTitle = sessionDetails.title;
    sd.sessionDays = getDaysForTerm(sd.term, sd.weekdays, sd.session);
  }
  sd.termName = terms[sd.term].name;
  sd.showSections.filter(s => s != "session").forEach(s => {
    sd.sections.push({
      title: sections.find(e => e.id==s).title,
      content: sd[s]
    });
  });
  generate("unis/" + sd.uni + "/template.docx", sd);
});
