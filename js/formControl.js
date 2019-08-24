function populateSections(sections) {
  sections.forEach( s => {
    $("#chooseSections").append(
      $('<div class="form-group">').append(
        $('<div class="form-check">').append(
          $('<input type="checkbox" class="form-check-input" name="' + s.flag + '" id="' + s.flag + '"' + (s.default ? " checked" : "") + '>')
        ).append(
          $('<label class="form-check-label" for="' + s.flag + '">').text(s.title)
        )
      ).append(
        $('<textarea rows="1" class="form-control" name="' + s.id + '" id="' + s.id + '">')
      )
    )
  });
  $("#session").text("Lesetext:\n\nWeiterführende Literatur:").attr("rows", "3").after(
    $('<small id="sessionHelp" class="form-text text-muted">').text("Wird als Platzhalter für jeden einzelnen Sitzungstermin eingefügt.")
  );
}

var termData;

function populateTerms(terms) {
  termData=terms;
  terms.forEach( t => {
    $("#termSelect").append(
      $('<option>').text(t.name)
    );
  });
}
    
var departments;
var defaults = {};

function populateDepartments(depts) {
  departments = depts;
  for (var i in depts) {
    $("#presetSelect").append(
      $('<option>').text(depts[i].display.replace(/\n/g, ", ")).val(i));
  }
  $("#presetSelect").append(
    $('<option>').text("Benutzerdefiniert...").val("custom")
  );
  setDepartmentDefaults();
}

function setDepartmentDefaults() {
  for(var dk in defaults) {
    if ($("#" + dk).val() == defaults[dk]){
      $("#" + dk).val("");
    }
  }
  var activeSelection = $("#presetSelect").children("option:selected").val();
  if(activeSelection == "custom") {
    $("#customDepartment").collapse("show");
    defaults = {};
  } else {
    $("#customDepartment").collapse("hide");
    var activeDepartment = departments[($("#presetSelect").children("option:selected").val())];
    defaults=activeDepartment.defaults;
    for (var dk in activeDepartment.defaults) {
      if($("#" + dk).val() == "")  $("#" + dk).val(activeDepartment.defaults[dk]);
    }
  }
}

$("body").ready( function() {
  $.getJSON("data/sections.json", populateSections);
  $.getJSON("data/departments.json", populateDepartments);
  $.getJSON("data/terms.json", populateTerms);
  var savedData = Cookies.getJSON();
  console.log(savedData);
});

$("#presetSelect").on("change", setDepartmentDefaults);
$("#saveData").click( function() {
  console.log("saving");
  $(this).addClass("d-none");
  $("#updateData").removeClass("d-none");
  $("#clearData").removeClass("d-none");
});
$("#updateData").click( function() {
  console.log("updating");
});
$("#clearData").click( function() {
  console.log("clearing");
  $(this).addClass("d-none");
  $("#updateData").addClass("d-none");
  $("#saveData").removeClass("d-none");
});

$("#syllabusForm").on( "submit", event => {
  event.preventDefault();
  var sd = $("#syllabusForm").serializeJSON();
  sd.days = getDaysForTerm(sd.term, sd.weekdays);
  sd.hasModule = sd.module != "";
  sd.hasRoom = sd.room != "";
  sd.hasTime = sd.time != "";
  sd.hasInfo = sd.time || sd.room;
  sd.department = sd.presetDepartment == "custom" ? sd.customDepartment : departments[sd.presetDepartment].display;
  sd.hasDepartment = sd.department !="";
  generate("syllabus_template.docx", sd);
});

$(".area-toggle").click( function() {
  $(this).siblings(".collapse").collapse("toggle");
  $(this).find("i").toggleClass("fa-plus-square").toggleClass("fa-minus-square");
});
