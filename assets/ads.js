(function(){
  var META = document.querySelector('meta[name="ads-client"]');
  var CLIENT = (window.ADSENSE_CLIENT || (META && META.content) || '').trim();
  var DEFAULT_CLIENT = 'ca-pub-4776426875987574';
  if(!CLIENT){ CLIENT = DEFAULT_CLIENT; }
  var DEFAULT_SLOTS = { top:'1234567001', middle:'1234567002', bottom:'1234567003' };
  var loaded=false; function load(cb){ if(loaded){ cb&&cb(); return; }
    var s=document.createElement('script'); s.async=true;
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(CLIENT);
    s.crossOrigin='anonymous'; s.onload=function(){ loaded=true; cb&&cb(); };
    s.onerror=function(){ cb&&cb(); }; document.head.appendChild(s); }
  function mount(div){ if(div._mounted) return; div._mounted=true;
    var slot=div.getAttribute('data-ad-slot')||DEFAULT_SLOTS[(div.getAttribute('data-slot')||'middle')]||DEFAULT_SLOTS.middle;
    var ins=document.createElement('ins'); ins.className='adsbygoogle'; ins.style.display='block';
    ins.setAttribute('data-ad-client', CLIENT);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format','auto');
    ins.setAttribute('data-full-width-responsive','true');
    div.innerHTML=''; div.appendChild(ins);
    (window.adsbygoogle=window.adsbygoogle||[]).push({});
  }
  function observe(){
    var nodes=[].slice.call(document.querySelectorAll('.ad-slot, .ad'));
    if(!nodes.length) return; var io=new IntersectionObserver(function(ents){
      ents.forEach(function(e){ if(e.isIntersecting){ load(function(){ mount(e.target); }); io.unobserve(e.target); } });
    },{rootMargin:'200px 0px'});
    nodes.forEach(function(n){ io.observe(n); });
  }
  document.addEventListener('DOMContentLoaded', observe);
})();

