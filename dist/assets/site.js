(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const lang = document.documentElement.lang;
  const messages = JSON.parse(document.getElementById('site-messages').textContent);
  const digits = value => String(value).replace(/\d/g,d => lang === 'fa' ? '۰۱۲۳۴۵۶۷۸۹'[Number(d)] : d);
  const text = (key,n) => messages[key].replace('{n}',digits(n));
  // Treat Persian/Arabic letter variants, joiners, and digits consistently in search.
  const normalize = value => String(value).normalize('NFKC').toLowerCase()
    .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
    .replace(/[۰-۹]/g,d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g,d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[\u200c\u200d]/g,'');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  function closeMenu(){menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label',text('openMenu'));nav?.classList.remove('open');}
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',text(open?'closeMenu':'openMenu'));nav.classList.toggle('open',open);});
  nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
  const pubs=[...document.querySelectorAll('.filterable-publications .publication')];
  const searchable=new Map(pubs.map(p=>[p,normalize(p.dataset.search)]));
  const search=document.querySelector('#publication-search');
  const year=document.querySelector('#publication-year');
  let type='all';
  function filterPublications(){
    const words=normalize(search?.value||'').trim().split(/\s+/).filter(Boolean);
    let shown=0;
    pubs.forEach(p=>{const show=(type==='all'||p.dataset.type===type)&&(!year||year.value==='all'||p.dataset.year===year.value)&&words.every(word=>searchable.get(p).includes(word));p.hidden=!show;if(show)shown++;});
    const counter=document.querySelector('#publication-count');
    if(counter)counter.textContent=text('showPubs',shown);
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
    try{if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(code.textContent);button.textContent=text('copied');status.textContent=text('copiedStatus');setTimeout(()=>{button.textContent=text('copyCitation');},2000);}
    catch{const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent=text('selectCopy');status.textContent=text('selectStatus');}
  }));
  document.querySelectorAll('[data-project-filter]').forEach(button=>button.addEventListener('click',()=>{
    const category=button.dataset.projectFilter;let shown=0;
    document.querySelectorAll('.project[data-category]').forEach(p=>{p.hidden=category!=='all'&&p.dataset.category!==category;if(!p.hidden)shown++;});
    document.querySelectorAll('[data-project-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    document.querySelector('#project-count').textContent=text('showProjects',shown);
  }));
})();
