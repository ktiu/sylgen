function loadFile(url,callback){
  PizZipUtils.getBinaryContent(url,callback);
}
function generate(syllabusTemplate, syllabusData) {
  event.preventDefault();
  loadFile(syllabusTemplate, function(error,content){
      if (error) { throw error };
      var zip = new PizZip(content);
      var doc=new window.docxtemplater().loadZip(zip)
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
