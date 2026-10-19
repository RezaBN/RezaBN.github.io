// Exercise shipped browser handlers in Node; this does not replace visual browser QA.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'assets/site.js'),'utf8');
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
class Element {
  constructor(dataset={}){this.dataset=dataset;this.events={};this.attrs={};this.hidden=false;this.value='';this.textContent='';this.classes=new Set();this.classList={add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};}
  addEventListener(key,fn){this.events[key]=fn;}
  setAttribute(key,value){this.attrs[key]=value;}
  getAttribute(key){return this.attrs[key];}
  click(){return this.events.click?.({target:this});}
  focus(){this.focused=true;}
}
for(const lang of ['en','fa']){
 const prefix=lang==='fa'?'fa/':'';
 const html=fs.readFileSync(path.join(root,'dist',prefix,'publications/index.html'),'utf8');
 const messages=JSON.parse(html.match(/<script type="application\/json" id="site-messages">([\s\S]*?)<\/script>/)[1]);
 const pubs=[...html.matchAll(/<article class="publication [^"]*" data-year="(\d+)" data-type="([^"]+)" data-search="([^"]+)"/g)].map(m=>new Element({year:m[1],type:m[2],search:decode(m[3])}));
 const filters=['all','journal','preprint'].map(typeFilter=>new Element({typeFilter}));
 const projectFilters=['all','research','reproduction'].map(projectFilter=>new Element({projectFilter}));
 const projects=['research','research','reproduction','reproduction'].map(category=>new Element({category}));
 const search=new Element(),year=new Element(),counter=new Element(),empty=new Element(),reset=new Element(),menu=new Element(),nav=new Element(),projectCount=new Element();
 year.value='all';menu.setAttribute('aria-expanded','false');
 const copy=new Element(),status=new Element(),code={textContent:'@article{sample, title = {Official English title}}'};
 copy.closest=()=>({querySelector:selector=>selector==='code'?code:status});
 const single={'.menu-toggle':menu,'#primary-nav':nav,'#publication-search':search,'#publication-year':year,'#publication-count':counter,'#no-publications':empty,'#reset-publications':reset,'[data-type-filter="all"]':filters[0],'#project-count':projectCount};
 const groups={'.filterable-publications .publication':pubs,'[data-type-filter]':filters,'[data-project-filter]':projectFilters,'.project[data-category]':projects,'.copy-citation':[copy]};
 let copied='';
 const document={documentElement:{lang,classList:{add(){}}},getElementById:()=>({textContent:JSON.stringify(messages)}),querySelector:s=>single[s],querySelectorAll:s=>groups[s]||[],addEventListener(){}};
 vm.runInNewContext(source,{document,navigator:{clipboard:{writeText:async text=>{copied=text;}}},setTimeout(){},console});
 const visible=()=>pubs.filter(p=>!p.hidden);
 const find=q=>{search.value=q;search.events.input();return visible();};
 assert.equal(find('۲۰۲۶').length,2,'Persian digits');
 assert.equal(find('٢٠٢٦').length,2,'Arabic digits');
 assert.equal(find('COLLABORATIVE').length,1,'English case');
 assert.equal(find('گروهي').length,3,'Arabic/Persian letter variants');
 assert.equal(find('توصیهگر').length,8,'Persian joiner normalization');
 assert.equal(find('leader 2026').length,1,'Multiple keywords');
 assert.equal(find('unmatchable-term').length,0);assert.equal(empty.hidden,false);
 reset.click();assert.equal(visible().length,9);assert.equal(empty.hidden,true);
 filters[2].click();assert.equal(visible().length,1);assert.equal(visible()[0].dataset.type,'preprint');
 filters[0].click();year.value='2024';year.events.change();assert.equal(visible().length,2);
 assert.equal(counter.textContent,messages.showPubs.replace('{n}',lang==='fa'?'۲':'2'));
 projectFilters[2].click();assert.equal(projects.filter(p=>!p.hidden).length,2);assert.equal(projectCount.textContent,messages.showProjects.replace('{n}',lang==='fa'?'۲':'2'));
 menu.click();assert.equal(menu.getAttribute('aria-expanded'),'true');assert.equal(menu.getAttribute('aria-label'),messages.closeMenu);
 menu.click();assert.equal(menu.getAttribute('aria-label'),messages.openMenu);
 await copy.click();assert.equal(copied,code.textContent);assert.equal(copy.textContent,messages.copied);assert.equal(status.textContent,messages.copiedStatus);
 console.log(`PASS ${lang}: bilingual search, digits, combined filters, reset, counters, project filters, menu, citation copy.`);
}
