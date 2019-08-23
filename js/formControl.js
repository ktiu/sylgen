function populateSections(sections) {
  sections.forEach( s => {
    $("#chooseSections").append(
      $('<div class="form-group">').append(
        $('<div class="row">').append(
          $('<div class="col-sm-1">').append(
            $('<input type="checkbox" class="form-control form-check-input" name="' + s.flag + '" id="' + s.flag + '"' + (s.default ? " checked" : "") + '>')
          )
        ).append(
          $('<div class="col-sm-11">').append(
            $('<label class="form-check-label" for="' + s.flag + '">').text(s.title)
          ).append(
            $('<textarea rows="1" class="form-control" name="' + s.id + '" id="' + s.id + '">')
          )
        )
      )
    )
  });
  $("#session").text("Lesetext:\n\nWeiterführende Literatur:").attr("rows", "3");
}

var departments;
var defaults = {};

function populateDepartments(depts) {
  departments = depts;
  for (var i in depts) {
    $("#presetSelect").append(
      $('<option>').text(depts[i].display.replace(/\n/g, ", ")).val(i));
  }
}

function setDepartmentDefaults() {
  for(var dk in defaults) {
    if ($("#" + dk).val() == defaults[dk]){
      $("#" + dk).val("");
    }
  }
  if($("input[name='departmentType']:checked").val() == "preset") {
    var activeDepartment = departments[($("#presetSelect").children("option:selected").val())];
    defaults=activeDepartment.defaults;
    for (var dk in activeDepartment.defaults) {
      $("#" + dk).val(activeDepartment.defaults[dk]);
    }
  } else {
    defaults = {};
  }
}

$("body").ready( function() {
  $.getJSON("data/sections.json", populateSections);
  $.getJSON("data/departments.json", populateDepartments);
});

$("#presetSelect").on("change", setDepartmentDefaults);
$("input[name='departmentType']").on("change", setDepartmentDefaults);

$("#syllabusForm").on( "submit", event => {
  event.preventDefault();
  var sd = $("#syllabusForm").serializeJSON();
  sd.days = getDaysForTerm(sd.term, sd.weekdays);
  sd.hasModule = sd.module != "";
  sd.hasRoom = sd.room != "";
  sd.hasTime = sd.time != "";
  sd.hasInfo = sd.time || sd.room;
  sd.department = sd.affiliationType == "preset" ? sd.presetAffiliation : sd.customAffiliation;
  sd.hasDepartment = sd.department !="";
  generate("syllabus_template.docx", sd);
});

$(".area-toggle").click( function() {
  $(this).siblings(".collapse").collapse("toggle");
  $(this).find("i").toggleClass("fa-plus-square").toggleClass("fa-minus-square");
});
