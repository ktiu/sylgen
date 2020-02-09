var departments;
var sections;
var terms;
var defaults = {};
var unis;

function changeTermMessage() {
  var uni = unis.filter(u => u.folder === $("#uni").val())[0];
  $("#termMessage").html(uni.termMessage);
}

function populateDepartments() {
  return $.get("unis/" + $("#uni").val() + "/departments.yaml", y => {
    departments = jsyaml.load(y).sort( (a, b) => { return a.name.localeCompare(b.name); });
    $("#presetDepartment").empty();
    for (var i in departments) {
      $("#presetDepartment").append(
        $('<option>').text(departments[i].display.trim().replace(/\n/g, ", ")).val(i)
      );
    }
    $("#presetDepartment").append(
      $('<option>').text("Andere...").val("custom")
    );
    setDefaults();
  }).fail( () => {
    console.error("departments for " + $("#uni").val() + " not found");
  });
}

function populateUnis() {
  return $.get("data/unis.yaml", y => {
    unis = jsyaml.load(y).sort( (a, b) => { return a.name.localeCompare(b.name); });
    $("#uni").empty();
    unis.forEach( u => {
      $("#uni").append(
        $('<option>').val(u.folder).text(u.name)
      );
    });
  })
    .then(populateDepartments)
    .then(populateTerms)
    .fail( () => {
      console.error("unis.yaml not found");
  });
}

function populateTerms() {
  return $.get("unis/" + $("#uni").val() + "/terms.yaml", y => {
    terms = jsyaml.load(y);
    var today = new Date();
    terms = terms.sort( (a, b) => {
      return (a.start - b.start)
    }).map( t => {
      if (t.start < today ) {
        t.name = `(${t.name})`;
      }
      return t;
    });
    var termsInPast = true;
    $("#term").empty();
    for (var i in terms) {
      var termOption = $('<option>').text(terms[i].name).val(i);
      if (termsInPast && terms[i].start > new Date()) {
        termOption = termOption.attr('selected', 'selected');
        termsinPast = false;
      }
      $("#term").append(termOption);
    }
    updatePreview();
  }).fail( () => {
    console.error("terms for " + $("#uni").val() + " not found");
  });
}

function populateSections() {
  return $.get("data/sections.yaml", y => {
    sections = jsyaml.load(y);
    $("#chooseSections").empty();
    sections.forEach( s => {
      $("#chooseSections").append(
        $('<div class="form-group">').append(
          $('<div class="form-check">').append(
            $('<input type="checkbox" class="form-check-input show-sections" name="showSections[]" value="' + s.id + '" id="show-section-' + s.id + '"' + (s.defaultInclude ? " checked" : "") + '>')
          ).append(
            $('<label class="form-check-label" for="show-section-' + s.id + '">').text(s.title)
          )
        ).append(
          $('<div id="section-details-'+s.id+'" class="collapse">').addClass(s.defaultInclude ? "show": "").append(
            $('<textarea rows="2" class="form-control" name="' + s.id + '" id="' + s.id + '">').text(s.defaultText)
          ).append(
            $('<small class="form-text text-muted">').text(s.helpText)
          ).append(
            s.id == "session" ? "<div class='form-check'> <input class='form-check-input' type='checkbox' id='numberSessions' value='numberSessions' name='numberSessions' checked><label class='form-check-label' for='numberSessions'>Sitzungen nummerieren</label></div>" : ""
          )
        )
      )
    });
    $(".show-sections").change( function() {
      $(this).parent().siblings(".collapse").collapse( this.checked? "show" : "hide");
    });
    $("#numberSessions").on("change", updatePreview); 
  });
}

function setDefaults() {
  for(var dk in defaults) {
    if ($("#" + dk).val() == defaults[dk]){
      $("#" + dk).val("");
    }
  }
  var activeSelection = $("#presetDepartment").children("option:selected").val();
  // add uni defaults here eventually
  if(activeSelection == "custom") {
    $("#customDepartment").collapse("show");
    defaults = {};
  } else {
    $("#customDepartment").collapse("hide");
    var activeDepartment = departments[($("#presetDepartment").children("option:selected").val())];
    defaults = activeDepartment.defaults;
    for (var dk in defaults) {
      if($("#" + dk).val() == "")  $("#" + dk).val(activeDepartment.defaults[dk]);
    }
  }
}

$("body").ready( function() {
  var uniPromise = populateUnis();
  var sectionPromise = populateSections();
  var savedData = Cookies.getJSON('formData');
  Promise.all([uniPromise, sectionPromise]).then( () => {
    if (savedData) {
      for (fk in savedData) {
        $("#" + fk ).val(savedData[fk]);
      }
      if(savedData.weekdays){
        $("input.weekdays").val(savedData.weekdays);
      }
      $("input.show-sections").val(savedData.showSections);
      sections.forEach( s => {
        if(savedData.showSections.includes(s.id)){
          $("#section-details-"+s.id).addClass("show");
        } else {
          $("#section-details-"+s.id).removeClass("show");
        }
      });
      if ($("#presetDepartment").val() == "custom") {
        $("#customDepartment").addClass("show");
      }
      updatePreview();
    }
    changeTermMessage();
  });
});

$("#uni").on("change", () => {
  populateTerms();
  populateDepartments();
  changeTermMessage();
});

$("#presetDepartment").on("change", setDefaults);

$(".area-toggle").click( function() {
  $(this).siblings(".collapse").collapse("toggle");
  $(this).find("i").toggleClass("fa-plus-square").toggleClass("fa-minus-square");
});

