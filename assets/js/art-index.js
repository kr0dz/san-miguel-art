// One mobile-menu controller for SMArt public pages.
// Unlike the legacy handler, this leaves body scrolling alone and gives the
// fixed menu its own independent touch-scroll area (important on iOS Safari).
(()=>{
  const toggle=document.querySelector('.reference-header .menu');
  const panel=document.querySelector('.mobile-nav');
  if(!toggle||!panel)return;
  const labelOpen=document.documentElement.lang.startsWith('en')?'Open menu':'Abrir menú';
  const labelClose=document.documentElement.lang.startsWith('en')?'Close menu':'Cerrar menú';

  function setOpen(open,{focusToggle=false}={}){
    panel.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?labelClose:labelOpen);
    panel.setAttribute('aria-hidden',String(!open));
    panel.inert=!open;
    document.body.classList.toggle('sm-menu-open',open);
    // Clear stale inline scroll locks left by prior navigation scripts.
    document.body.style.removeProperty('overflow');
    if(open)panel.querySelector('a')?.focus({preventScroll:true});
    if(!open&&focusToggle)toggle.focus({preventScroll:true});
  }

  // No double toggles: the old listener is disabled for the art edition.
  toggle.addEventListener('click',()=>setOpen(!panel.classList.contains('open')));
  panel.addEventListener('click',event=>{
    if(event.target.closest('a'))setOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(!panel.classList.contains('open'))return;
    if(event.key==='Escape'){
      event.preventDefault();
      setOpen(false,{focusToggle:true});
    }
    if(event.key==='Tab'){
      const links=Array.from(panel.querySelectorAll('a:not([hidden])'));
      const items=[toggle,...links].filter(item=>!item.inert);
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){
        event.preventDefault();last?.focus();
      }else if(!event.shiftKey&&document.activeElement===last){
        event.preventDefault();first?.focus();
      }
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(panel.classList.contains('open')&&!panel.contains(event.target)&&!toggle.contains(event.target)){
      setOpen(false);
    }
  });
  window.addEventListener('resize',()=>{
    if(innerWidth>900&&panel.classList.contains('open'))setOpen(false);
  },{passive:true});
  window.addEventListener('pageshow',()=>setOpen(false));
  setOpen(false);
})();