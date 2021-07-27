var daysClip;

const updatePreview = () => {
  var weekdays = [];
  var daysString;
  $.each($("input[name='weekdays[]']:checked"), function(){
    weekdays.push(Number($(this).val()));
  });
  if(!weekdays.length) {
    daysString = "Kein Wochentag ausgesucht"; 
  } else {
    var days = getDaysForTerm($("#term").val(), weekdays, "").map((d, i) => `${d.string}`)
    daysString = days.join("<br/>");
    daysClip = days.join("\n");
  }
  $("#preview").tooltip('dispose');
  $("#preview").tooltip({'title': daysString, 'html': true});
};

// stole the next 2 functions straight from so
// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position="fixed";  //avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

$("#preview").click( () => { copyTextToClipboard(daysClip); });

$("#term").on("change", updatePreview); 
$("input[name='weekdays[]']").on("change", updatePreview); 
