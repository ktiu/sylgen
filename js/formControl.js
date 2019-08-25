var sectionData;

function populateSections(sections) {
  sectionData = sections;
  sections.forEach( s => {
    $("#chooseSections").append(
      $('<div class="form-group">').append(
        $('<div class="form-check">').append(
          $('<input type="checkbox" class="form-check-input show-sections" name="' + s.flag + '" value="' + s.flag + '" id="' + s.flag + '"' + (s.default ? " checked" : "") + '>')
        ).append(
          $('<label class="form-check-label" for="' + s.flag + '">').text(s.title)
        )
      ).append(
        $('<textarea rows="2" class="form-control" name="' + s.id + '" id="' + s.id + '">')
      )
    )
  });
  $("#session").text("Lesetext:\nWeiterführende Literatur:").attr("rows", "2").after(
    $('<small id="sessionHelp" class="form-text text-muted">').text("Wird als Platzhalter für jeden einzelnen Sitzungstermin eingefügt.")
  );
}

var termData;

function populateTerms(terms) {
  termData=terms;
  terms.forEach( t => {
    $("#term").append(
      $('<option>').text(t.name)
    );
  });
}
    
var departments;
var defaults = {};

function populateDepartments(depts) {
  departments = depts;
  for (var i in depts) {
    $("#presetDepartment").append(
      $('<option>').text(depts[i].display.replace(/\n/g, ", ")).val(i));
  }
  $("#presetDepartment").append(
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
  var activeSelection = $("#presetDepartment").children("option:selected").val();
  if(activeSelection == "custom") {
    $("#customDepartment").collapse("show");
    defaults = {};
  } else {
    $("#customDepartment").collapse("hide");
    var activeDepartment = departments[($("#presetDepartment").children("option:selected").val())];
    defaults=activeDepartment.defaults;
    for (var dk in activeDepartment.defaults) {
      if($("#" + dk).val() == "")  $("#" + dk).val(activeDepartment.defaults[dk]);
    }
  }
}

$("body").ready( function() {
  var sectionPromise = $.getJSON("data/sections.json", populateSections);
  var departmentPromise = $.getJSON("data/departments.json", populateDepartments);
  var termPromise = $.getJSON("data/terms.json", populateTerms);
  var savedData = Cookies.getJSON('formData');
  if (savedData) {
    Promise.all([sectionPromise, departmentPromise, termPromise]).then(function(){
      for (fk in savedData) {
        $("#" + fk ).val(savedData[fk]);
      }
      $("input.weekdays").val(savedData.weekdays);
      var showSections = sectionData.filter(s => savedData[s.flag] === s.flag).map(s => s.flag);
      $("input.show-sections").val(showSections);
      if ($("#presetDepartment").val() == "custom") {
        $("#customDepartment").addClass("show");
      }
    });
    $("#saveData").addClass("d-none");
    $("#updateData").removeClass("d-none");
    $("#clearData").removeClass("d-none");
  }
});

$("#presetDepartment").on("change", setDepartmentDefaults);

$("#saveData").click( function() {
  var formData = $("#syllabusForm").serializeJSON();
  Cookies.set('formData', formData, { expires: (365 * 10) });
  $(this).addClass("d-none");
  $("#updateData").removeClass("d-none");
  $("#clearData").removeClass("d-none");
});

$("#updateData").click( function() {
  var formData = $("#syllabusForm").serializeJSON();
  Cookies.set('formData', formData);
});

$("#clearData").click( function() {
  Cookies.remove('formData');
  $(this).addClass("d-none");
  $("#updateData").addClass("d-none");
  $("#saveData").removeClass("d-none");
  location.reload(true);
});

$(".area-toggle").click( function() {
  $(this).siblings(".collapse").collapse("toggle");
  $(this).find("i").toggleClass("fa-plus-square").toggleClass("fa-minus-square");
});
