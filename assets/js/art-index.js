(()=>{
  const menu=document.querySelector('.reference-header .menu');
  const mobile=document.querySelector('.mobile-nav');
  if(!menu||!mobile)return;
  const sync=()=>menu.setAttribute('aria-expanded',mobile.classList.contains('open')?'true':'false');
  menu.addEventListener('click',()=>requestAnimationFrame(sync));
  mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');}));
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!mobile.classList.contains('open'))return;
    mobile.classList.remove('open');
    document.body.style.overflow='';
    menu.setAttribute('aria-expanded','false');
    menu.focus();
  });
  sync();
})();