(function(){
  document.body.addEventListener("keydown", function(e) {
    if(navigator.platform.match("Mac") ? e.metaKey : e. ctrlKey){
      if(e.keyCode == "E".charCodeAt(0)){
        goEditPage();
        e.preventDefault();
      } else if(e.keyCode == "M".charCodeAt(0)){
        goMovePage();
        e.preventDefault();
      } else if(e.keyCode == "L".charCodeAt(0)){
        goViewPage();
        e.preventDefault();
      } else if(e.keyCode == "S".charCodeAt(0)){
        saveData();
        e.preventDefault();
      }
    }
  }, false);

  var textarea = document.getElementsByTagName("textarea")[0];
  if(textarea){
    textarea.focus();
  }
  
  function goViewPage(){
    location.href = getUrl();
  }
  function goEditPage(){
    location.href = getUrl() + "?edit";
  }
  function goMovePage(){
    location.href = getUrl() + "?move";
  }

  function saveData(){
    if(textarea){
      textarea.form.submit();
    }
  }
  function getUrl(){
    return location.pathname;
  }
})();
