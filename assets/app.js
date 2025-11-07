(function(){
  function addRecent(slug,name){
    try{
      var key="recentlyPlayed";
      var arr=JSON.parse(localStorage.getItem(key)||"[]");
      arr=arr.filter(function(x){return x.slug!==slug});
      arr.unshift({slug:slug,name:name,ts:Date.now()});
      if(arr.length>12) arr=arr.slice(0,12);
      localStorage.setItem(key,JSON.stringify(arr));
    }catch(e){}
  }
  function renderRecent(){
    var el=document.getElementById("recently-played");
    if(!el) return;
    try{
      var arr=JSON.parse(localStorage.getItem("recentlyPlayed")||"[]");
      if(!arr.length){ el.style.display="none"; return; }
      var html=arr.map(function(it){return "<a href=\"/game/"+it.slug+"/\">"+it.name+"</a>"}).join(" - ");
      el.innerHTML=html;
    }catch(e){ el.style.display="none"; }
  }
  window.PLAYARENA={ addRecent:addRecent };
  document.addEventListener("DOMContentLoaded",renderRecent);
})();
