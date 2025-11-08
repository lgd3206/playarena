(function(){
  var gameMap = null;

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

  function getRecentTargets(){
    var nodes=[].slice.call(document.querySelectorAll('[data-recently-played], #recently-played'));
    var seen=[];
    nodes.forEach(function(node){
      if(seen.indexOf(node)===-1){ seen.push(node); }
    });
    return seen;
  }

  function renderRecent(){
    var targets=getRecentTargets();
    if(!targets.length) return;
    try{
      var arr=JSON.parse(localStorage.getItem("recentlyPlayed")||"[]");
      if(!arr.length){
        targets.forEach(function(el){
          el.style.display="none";
          el.innerHTML="";
        });
        return;
      }
      var html=arr.map(function(it){return '<a href="/game/'+it.slug+'/">'+it.name+'</a>';}).join(' ? ');
      targets.forEach(function(el){
        el.style.display="";
        el.innerHTML=html;
      });
    }catch(e){
      targets.forEach(function(el){ el.style.display="none"; });
    }
  }

  function ensureCardDataset(card){
    if(!card) return;
    if(!card.getAttribute('data-name')){
      var text = '';
      var h3=card.querySelector('h3');
      text = (h3 ? h3.textContent : card.textContent || '').trim().toLowerCase();
      card.setAttribute('data-name',text);
    }
    if(!card.dataset.searchMatch){ card.dataset.searchMatch='1'; }
    if(!card.dataset.mobileMatch){ card.dataset.mobileMatch='1'; }
  }

  function updateCardVisibility(card){
    if(!card) return;
    var ok = card.dataset.searchMatch !== '0' && card.dataset.mobileMatch !== '0';
    card.style.display = ok ? '' : 'none';
  }

  function bindSearch(){
    var box=document.getElementById('site-search');
    if(!box) return;
    var cards=[].slice.call(document.querySelectorAll('.grid .card'));
    cards.forEach(ensureCardDataset);
    function apply(){
      var q=(box.value||'').toLowerCase().trim();
      cards.forEach(function(card){
        var name=card.getAttribute('data-name')||'';
        card.dataset.searchMatch = (!q || name.indexOf(q)>-1) ? '1':'0';
        updateCardVisibility(card);
      });
    }
    box.addEventListener('input',apply);
    apply();
  }

  function getSlugFromHref(href){
    if(!href) return null;
    var match = href.match(/\/game\/([^\/]+)\//);
    return match ? match[1] : null;
  }

  function annotateCard(card){
    if(!card || !gameMap) return;
    ensureCardDataset(card);
    var slug = card.dataset.slug || getSlugFromHref(card.getAttribute('href'));
    if(!slug) return;
    card.dataset.slug = slug;
    var info = gameMap[slug];
    if(!info) return;
    var h3 = card.querySelector('h3');
    if(h3 && !h3.querySelector('.chip')){
      var chip=document.createElement('span');
      chip.className='chip '+(info.mobileFriendly===false?'chip-desktop':'chip-ok');
      chip.textContent= info.mobileFriendly===false ? 'Desktop only' : 'Mobile OK';
      h3.appendChild(document.createTextNode(' '));
      h3.appendChild(chip);
    }
  }

  function annotateHero(){
    if(!gameMap) return;
    var match = window.location.pathname.match(/\/game\/([^\/]+)\//);
    if(!match) return;
    var info = gameMap[match[1]];
    if(!info) return;
    var target=document.querySelector('.hero h1');
    if(target && !document.querySelector('.hero .chip')){
      var chip=document.createElement('span');
      chip.className='chip '+(info.mobileFriendly===false?'chip-desktop':'chip-ok');
      chip.textContent= info.mobileFriendly===false ? 'Desktop only' : 'Mobile OK';
      target.appendChild(document.createTextNode(' '));
      target.appendChild(chip);
    }
    if(info.mobileFriendly===false){
      var note=document.createElement('div');
      note.className='notice';
      note.textContent='Heads up: this game needs a keyboard/mouse and may not run well on phones.';
      var hero=document.querySelector('.hero');
      hero && hero.appendChild(note);
    }
  }

  function setupMobileFilter(){
    if(!gameMap) return;
    var ua=(navigator.userAgent||'');
    if(!/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return;
    var cards=[].slice.call(document.querySelectorAll('.grid .card'));
    if(!cards.length) return;
    var hero=document.querySelector('.hero');
    var notice=document.createElement('div');
    notice.className='notice';
    var text=document.createElement('span');
    text.textContent='On mobile? Filter to touch-friendly picks.';
    var btn=document.createElement('button');
    btn.type='button';
    btn.textContent='View all games';
    notice.appendChild(text);
    notice.appendChild(btn);
    hero && hero.appendChild(notice);
    var mobileOnly=true;
    function apply(){
      cards.forEach(function(card){
        var slug=card.dataset.slug || getSlugFromHref(card.getAttribute('href'));
        var info=slug && gameMap[slug];
        var ok = !mobileOnly || !info || info.mobileFriendly!==false;
        card.dataset.mobileMatch = ok?'1':'0';
        updateCardVisibility(card);
      });
    }
    btn.addEventListener('click',function(){
      mobileOnly=!mobileOnly;
      btn.textContent = mobileOnly ? 'View all games' : 'Only mobile-friendly';
      apply();
    });
    apply();
  }

  function loadGameMeta(){
    fetch('/data/games.json', {cache:'no-store'})
      .then(function(resp){ return resp.json(); })
      .then(function(data){
        var map={};
        (data.games||[]).forEach(function(g){ map[g.slug]=g; });
        gameMap=map;
        document.querySelectorAll('.grid .card').forEach(annotateCard);
        annotateHero();
        setupMobileFilter();
      })
      .catch(function(){ /* ignore */ });
  }

  document.addEventListener('DOMContentLoaded',function(){
    renderRecent();
    bindSearch();
    loadGameMeta();
  });

  window.PLAYARENA={ addRecent:addRecent };
})();
