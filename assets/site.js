(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  function closeMenu(){menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation');nav?.classList.remove('open');}
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open);});
  nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});

  const pubs=[...document.querySelectorAll('.filterable-publications .publication')];
  const search=document.querySelector('#publication-search');
  const year=document.querySelector('#publication-year');
  let type='all';
  function filterPublications(){
    const words=(search?.value||'').toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown=0;
    pubs.forEach(p=>{const show=(type==='all'||p.dataset.type===type)&&(!year||year.value==='all'||p.dataset.year===year.value)&&words.every(word=>p.dataset.search.includes(word));p.hidden=!show;if(show)shown++;});
    const counter=document.querySelector('#publication-count');
    if(counter)counter.textContent=`Showing ${shown} ${shown===1?'publication':'publications'}`;
    const empty=document.querySelector('#no-publications');if(empty)empty.hidden=shown!==0;
  }
  document.querySelectorAll('[data-type-filter]').forEach(button=>button.addEventListener('click',()=>{
    type=button.dataset.typeFilter;
    document.querySelectorAll('[data-type-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});filterPublications();
  }));
  search?.addEventListener('input',filterPublications);year?.addEventListener('change',filterPublications);
  document.querySelector('#reset-publications')?.addEventListener('click',()=>{search.value='';year.value='all';document.querySelector('[data-type-filter="all"]').click();search.focus();});
  document.querySelectorAll('.copy-citation').forEach(button=>button.addEventListener('click',async()=>{
    const parent=button.closest('.citation-content');const code=parent.querySelector('code');const status=parent.querySelector('.copy-status');
    try{if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(code.textContent);button.textContent='Copied';status.textContent='Citation copied to clipboard.';setTimeout(()=>{button.textContent='Copy citation';},2000);}
    catch{const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='Select and copy';status.textContent='Citation selected. Use your browser’s copy command.';}
  }));
  document.querySelectorAll('[data-project-filter]').forEach(button=>button.addEventListener('click',()=>{
    const category=button.dataset.projectFilter;let shown=0;
    document.querySelectorAll('.project[data-category]').forEach(p=>{p.hidden=category!=='all'&&p.dataset.category!==category;if(!p.hidden)shown++;});
    document.querySelectorAll('[data-project-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    document.querySelector('#project-count').textContent=`Showing ${shown} projects`;
  }));
})();
