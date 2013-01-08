(function(){
  var textarea = document.getElementsByTagName("textarea")[0];
  textarea.addEventListener("keydown", function(e) {
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      textarea.form.submit();
    }
  }, false);
})();
