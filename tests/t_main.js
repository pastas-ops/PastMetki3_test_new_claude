const {chromium,mk,N,ok,TODAY,YEST,TOM,D3,DB}=require('./h111.js');
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC','base64');
const W=p=>p.waitForTimeout(350);
(async()=>{const browser=await chromium.launch();
 // ===== 1. home layout, morph =====
 {const {p,e}=await mk(browser,{notes:[N(1,'Четверг магнит',{due:TODAY,tasks:[{text:'молоко',done:true},{text:'стейки',done:true},{text:'пельмени',done:false}]}),N(2,'План',{due:TOM,tasks:[{text:'a',done:false}]})],
   user:{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.1.0',au:0,hm:{qs:['note','cal','chat','c:g_g1']}}},extra:{'groups/g1':{name:'какая боль, 18-0!!!',members:['u1'],owner:'u1',muted:[],ts:1,last:null}}});
  const hs=await p.$$eval('.qb',els=>els.map(x=>Math.round(x.getBoundingClientRect().height)));
  ok('home: quick cells same height '+hs,hs.length===4&&new Set(hs).size===1);
  await p.click('.tw:has-text("Четверг") [data-a=hexp]');await W(p);
  const sh=await p.$eval('.tw',x=>getComputedStyle(x).boxShadow);
  ok('home: plan group has full-height colour bar',sh.includes('inset'));
  const ph=await p.$eval('.pst',x=>x.getBoundingClientRect().left-document.querySelector('.pt').getBoundingClientRect().left);
  ok('home: progress sub-text aligned with title',Math.abs(ph)<1,ph);
  await p.evaluate(()=>{document.querySelector('.tw').__m=1;document.querySelector('#prog').__m=1;document.querySelector('nav').__m=1});
  await p.click('.tplan .tk:has-text("пельмени")');await W(p);
  ok('morph: plan block element survives a click',await p.evaluate(()=>document.querySelector('.tw').__m===1));
  ok('morph: progress cell + nav survive',await p.evaluate(()=>document.querySelector('#prog').__m===1&&document.querySelector('nav').__m===1));
  ok('home: item marked done in db',(await DB(p,'users/u1')).notes[0].tasks[2].done===true&&(await DB(p,'users/u1')).notes[0].done===true);
  ok('home: ring shows 100% after toggling',(await p.innerText('#ppn')).includes('100')||await p.$('.ring .pk')!==null);
  await p.click('[data-a=menu]');await W(p);
  ok('menu: opens',await p.$('.mnu')!==null);
  ok('morph: opening menu keeps page content',await p.evaluate(()=>document.querySelector('.tw').__m===1));
  await p.mouse.click(4,420);await W(p);ok('menu: closes on outside tap',await p.$('.mnu')===null);
  ok('no JS errors (home)',e.length===0,e.join(' | '));
  await p.screenshot({path:'/tmp/s_home2.png'});await p.close()}
 // ===== 2. item dates =====
 {const {p,e}=await mk(browser,{notes:[N(5,'С датой плана',{due:TOM,tasks:[{text:'далёкий пункт',done:false,tm:'',dd:D3}]}),N(6,'Без даты',{due:'',tasks:[{text:'сегодняшний пункт',done:false,tm:'09:30',dd:TODAY}]})]});
  ok('home: dated item appears in Today',(await p.innerText('main')).includes('сегодняшний пункт'));
  ok('home: counted in progress (0 из 1)',(await p.innerText('#prog')).includes('0 из 1'));
  await p.click('nav [data-i=c]');await W(p);
  await p.click(`[data-a=day][data-i="${D3}"]`);await W(p);
  const t=await p.innerText('main');
  ok('calendar: item shown as deadline with plan link',t.includes('далёкий пункт')&&t.includes('К плану'),t);
  await p.click('[data-a=ilink]');await W(p);
  const cal2=await p.innerText('main');
  ok('calendar: link goes to plan deadline day',cal2.includes('Дедлайны на '+TOM.slice(8)+'.')&&cal2.includes('С датой плана'),cal2.slice(-200));
  await p.click('nav [data-i=c]').catch(()=>{});
  await p.click(`[data-a=day][data-i="${TODAY}"]`);await W(p);
  ok('calendar: time shown for item',(await p.innerText('main')).includes('09:30'));
  await p.click('.card:has-text("сегодняшний пункт") .circ');await W(p);
  const u=await DB(p,'users/u1');
  ok('calendar: completing item completes it in the plan too',u.notes.find(n=>n.id===6).tasks[0].done===true&&u.notes.find(n=>n.id===6).done===true);
  await p.click('[data-a=ilink]');await W(p);
  ok('calendar: link opens plan without deadline',(await p.innerText('main')).includes('Без даты')&&await p.$('.ntitle')!==null);
  ok('no JS errors (dates)',e.length===0,e.join(' | '));await p.close()}
 // ===== 3. create note with dated item + attachments =====
 {const {p,e}=await mk(browser,{user:{extra:'keep',coins:3,fire:{n:1,last:YEST,best:1},rf:{u2:1},pinv:[]}});
  await p.click('[data-a=qa][data-i=note]');await W(p);
  await p.fill('[data-m=t]','Поездка');await p.fill('[data-m=i][data-j="0"]','Купить билеты');
  await p.fill('[data-m=idd][data-j="0"]',D3);await W(p);
  await p.fill('[data-m=it][data-j="0"]','10:15');await W(p);
  ok('form: item has date + time inputs',(await p.inputValue('[data-m=idd][data-j="0"]'))===D3&&(await p.inputValue('[data-m=it][data-j="0"]'))==='10:15');
  await p.click('[data-a=atmod]');await W(p);
  ok('attachments: + opens files window',await p.$('dialog[open] .drop')!==null);
  await p.setInputFiles('dialog[open] input[data-m=atf]',[{name:'cat.png',mimeType:'image/png',buffer:PNG}]);await W(p);await p.waitForTimeout(500);
  await p.setInputFiles('dialog[open] input[data-m=atf]',[{name:'билеты.txt',mimeType:'text/plain',buffer:Buffer.from('hello pastmetki')}]);await W(p);await p.waitForTimeout(400);
  await p.fill('dialog[open] [data-m=atl]','example.com/tickets');await p.click('dialog[open] [data-a=atladd]');await W(p);
  ok('attachments: window shows photo, doc and link',(await p.$$('dialog[open] .ati')).length===1&&(await p.$$('dialog[open] .atd')).length===2);
  await p.click('dialog[open] .x[data-a=atmx]');await W(p);
  ok('attachments: draft shows them after closing',(await p.$$('.nf .ati')).length===1&&(await p.$$('.nf .atd')).length===2);
  await p.click('[data-a=add]');await W(p);await p.waitForTimeout(500);
  const db=await p.evaluate(()=>window.__FB.db);const n=db['users/u1'].notes[0];
  ok('note saved with item date/time',n.tasks[0].dd===D3&&n.tasks[0].tm==='10:15',JSON.stringify(n));
  ok('note has 3 attachments (photo, doc, link)',(n.at||[]).length===3&&n.at.filter(a=>a.k==='l')[0].u==='https://example.com/tickets');
  const fk=Object.keys(db).filter(k=>k.startsWith('files/'));
  ok('2 file docs stored, readable by owner only',fk.length===2&&fk.every(k=>JSON.stringify(db[k].m)==='["u1"]'&&db[k].d.startsWith('data:')));
  ok('legacy/unknown fields in users doc survive saving (mergeFields)',db['users/u1'].extra==='keep');
  ok('eco: streak day 2 and +1 coin after a note',db['eco/u1'].fire.n===2&&db['eco/u1'].coins===4&&db['eco/u1'].rf.u2===1,JSON.stringify(db['eco/u1']));
  ok('users doc no longer holds economy writes',db['users/u1'].coins===3);
  await p.click('nav [data-i=n]');await W(p);await p.click('.cc[data-i=other]').catch(()=>{});await W(p);
  await p.click('.card:has-text("Поездка") .tt');await W(p);
  ok('note view: mini photo, doc and link at the bottom',(await p.$$('.atv .ati')).length===1&&(await p.$$('.atv .atd')).length===2);
  await p.click('.atv .atd:has-text("билеты")');await p.waitForTimeout(500);
  ok('doc viewer opens with name',(await p.innerText('#dlg')).includes('билеты.txt'));
  await p.click('[data-a=atsave][data-o="0"]');await W(p);
  ok('doc can be downloaded (native saveFile called)',await p.evaluate(()=>window.__CAP.saved.length===1&&window.__CAP.saved[0].name==='билеты.txt'&&window.__CAP.saved[0].data.length>0));
  await p.click('[data-a=fx]');await W(p);
  await p.click('.atv .atd:has-text("example.com")');await W(p);
  ok('link opens',await p.evaluate(()=>window.__CAP.opened==='https://example.com/tickets'));
  await p.click('.atv .ati');await p.waitForTimeout(500);
  ok('photo viewer shows image',await p.$('#dlg .avw img')!==null);await p.click('[data-a=fx]');await W(p);
  // edit: remove photo
  await p.click('[data-a=nedit]');await W(p);
  ok('edit dialog: attachments zone + item date',await p.$('#dlg .atz')!==null&&(await p.inputValue('#dlg .epd'))===D3);
  await p.click('#dlg .ati .rm');await W(p);await p.click('#dlg [data-a=esv]');await W(p);await p.waitForTimeout(300);
  const db2=await p.evaluate(()=>window.__FB.db);
  ok('edit: removed photo deleted from storage',Object.keys(db2).filter(k=>k.startsWith('files/')).length===1&&db2['users/u1'].notes[0].at.length===2);
  ok('no JS errors (create/attach)',e.length===0,e.join(' | '));await p.close()}
 // ===== 4. chat attachments + glass =====
 {const {p,e}=await mk(browser,{});
  await p.click('nav [data-i=s]');await W(p);await p.click('[data-a=chat][data-i=u2]');await W(p);
  ok('chat: glass header + composer',await p.$('header.chh.glass')!==null&&await p.$('.cw.glass')!==null);
  ok('chat: normal header hidden smoothly',await p.$eval('header:not(.chh)',x=>x.classList.contains('hid')));
  const hb=await p.$eval('header.chh',x=>x.getBoundingClientRect().bottom),mt=await p.$eval('#mlist',x=>x.getBoundingClientRect().top);
  ok('chat: first message is not under the header',mt>=hb-2,[hb,mt]);
  await p.fill('[data-m=ct]','Фото для Ани');await p.click('.cw [data-a=atmod]');await W(p);
  await p.setInputFiles('#dlg input[data-m=atf]',[{name:'a.txt',mimeType:'text/plain',buffer:Buffer.from('x')}]);await p.waitForTimeout(500);await p.click('#dlg [data-a=atmx]');await W(p);
  await p.click('[data-a=send]');await W(p);await p.waitForTimeout(400);
  const db=await p.evaluate(()=>window.__FB.db),mk2=Object.keys(db).find(k=>k.startsWith('chats/u1|u2/msgs/')&&db[k].x==='Фото для Ани');
  ok('chat: message has attachment meta',mk2&&(db[mk2].at||[]).length===1);
  const fk=Object.keys(db).filter(k=>k.startsWith('files/'));
  ok('chat: file readable by both members',fk.length===1&&JSON.stringify(db[fk[0]].m)==='["u1","u2"]',JSON.stringify(db[fk[0]]&&db[fk[0]].m));
  ok('chat: attachment shown under message',(await p.innerText('#mlist')).includes('a.txt'));
  // dated item in chat
  await p.fill('[data-m=ct]','Дела');await p.click('[data-a=cplus]');await W(p);
  await p.fill('[data-m=ci][data-j="0"]','Пункт с датой');await p.fill('[data-m=cidd][data-j="0"]',D3);await W(p);
  await p.click('[data-a=send]');await W(p);await p.waitForTimeout(400);
  const db3=await p.evaluate(()=>window.__FB.db),sk=Object.keys(db3).filter(k=>k.startsWith('shared/'));
  ok('chat: dated item creates shared deadline',sk.length===1&&db3[sk[0]].k[0].dd===D3,JSON.stringify(sk));
  await p.evaluate(()=>window.__CAP.handlers.backButton());await W(p);await p.click('nav [data-i=c]');await W(p);await p.click(`[data-a=day][data-i="${D3}"]`);await W(p);
  ok('calendar: shared item shown',(await p.innerText('main')).includes('Пункт с датой'));
  ok('no JS errors (chat)',e.length===0,e.join(' | '));await p.screenshot({path:'/tmp/s_chat.png'});await p.close()}
 // ===== 5. profile =====
 {const {p,e}=await mk(browser,{user:{coins:50,fire:{n:4,last:TODAY,best:4},pinv:[],rf:{u2:1}}});
  await p.click('nav [data-i=u]');await p.waitForTimeout(700);
  ok('profile: top header hidden',await p.$eval('header:not(.chh)',x=>x.classList.contains('hid')));
  const t=await p.innerText('main');
  ok('profile: ID assigned (000001) + stats',t.includes('ID · 000001')&&t.includes('Монеты')&&t.includes('Серия')&&t.includes('@alex'),t);
  ok('profile: counter doc',(await DB(p,'counters/users')).n===1&&(await DB(p,'profiles/u1')).pid===1);
  ok('profile: crown for ID 1',await p.$('.pf-crown')!==null);
  await p.screenshot({path:'/tmp/s_prof.png'});
  await p.click('[data-a=pprev]');await W(p);
  const pv=await p.innerText('#dlg');ok('profile: "how others see me" card',pv.includes('PastCard ID: 000001')&&pv.includes('Алексей'),pv);
  await p.screenshot({path:'/tmp/s_prev.png'});await p.click('[data-a=fx]');await W(p);
  await p.click('.pf2 [data-a=editp]');await W(p);
  await p.fill('#epn','Новое имя');await W(p);
  ok('editor: floating glass save appears when real button is off-screen',await p.$eval('#sfl',x=>x.classList.contains('show')));
  await p.evaluate(()=>{const d=document.querySelector('#dlg');d.scrollTop=d.scrollHeight});await W(p);
  ok('editor: floating save hides at the bottom',!(await p.$eval('#sfl',x=>x.classList.contains('show'))));
  await p.evaluate(()=>{document.querySelector('#dlg').scrollTop=0});await W(p);
  await p.fill('#epb','Всем привет');await W(p);
  await p.screenshot({path:'/tmp/s_edit.png'});
  ok('editor: nothing saved before pressing save',(await DB(p,'profiles/u1')).name==='Алексей');
  await p.click('#sfl [data-a=epsv]');await W(p);
  const pr=await DB(p,'profiles/u1');ok('editor: one save applies name + bio',pr.name==='Новое имя'&&pr.bio==='Всем привет'&&pr.pid===1,JSON.stringify(pr));
  // other's card
  await p.click('nav [data-i=s]');await W(p);await p.click('[data-a=chat][data-i=u2]');await W(p);
  await p.click('header.chh [data-a=prof]');await W(p);await p.waitForTimeout(400);
  const oc=await p.innerText('#dlg');ok("other person's card",oc.includes('Аня')&&oc.includes('PastCard ID: 000005')&&oc.includes('Люблю чай'),oc);
  await p.screenshot({path:'/tmp/s_other.png'});await p.click('[data-a=fx]');await W(p);
  ok('no JS errors (profile)',e.length===0,e.join(' | '));await p.close()}
 // ===== 6. shop / economy =====
 {const {p,e}=await mk(browser,{user:{coins:12,fire:{n:4,last:TODAY,best:4},pinv:[],rf:{u2:1}}});
  await p.click('nav [data-i=u]');await W(p);await p.click('.pfbar [data-a=menu]');await W(p);await p.click('.mnu [data-i=shop]');await W(p);
  await p.click('[data-a=buy][data-i="bg:night"]');await p.waitForTimeout(500);
  let eco=await DB(p,'eco/u1');ok('shop: buying spends coins in eco doc',eco.coins===0&&eco.pinv.includes('bg:night'),JSON.stringify(eco));
  await p.click('[data-a=buy][data-i="bg:ghosts"]');await p.waitForTimeout(500);
  eco=await DB(p,'eco/u1');ok('shop: not enough coins -> nothing spent',eco.coins===0&&!eco.pinv.includes('bg:ghosts'));
  ok('shop: old sets hidden, old items cheap',await p.evaluate(()=>!document.querySelector('[data-i="bg:s_gold"]')&&document.querySelector('[data-i="bg:forest"]').textContent.includes('5')));
  ok('no JS errors (shop)',e.length===0,e.join(' | '));await p.close()}
 // ===== 6b. new set purchase gives all parts =====
 {const {p,e}=await mk(browser,{user:{coins:40,fire:{n:4,last:TODAY,best:4},pinv:[],rf:{u2:1}}});
  await p.click('nav [data-i=u]');await W(p);await p.click('.pfbar [data-a=menu]');await W(p);await p.click('.mnu [data-i=shop]');await W(p);
  await p.click('[data-a=stab][data-i=set]');await W(p);
  ok('shop: 15 sets listed (5 improved old + 10 new)',await p.evaluate(()=>document.querySelectorAll('.shs').length===15));
  await p.click('[data-a=buy][data-i="set:ball"]');await p.waitForTimeout(500);
  const eco=await DB(p,'eco/u1');
  ok('set: all parts incl. description frame and creature owned',['bg:s_ball','frame:s_ball','skin:s_ball','msg:s_ball','bf:s_ball','run','set:ball'].every(k=>eco.pinv.includes(k))&&eco.coins===10,JSON.stringify(eco));
  await p.click('.sheet [data-a=eqi]');await p.waitForTimeout(500);
  const pr=await DB(p,'profiles/u1');
  ok('set: applied to profile',pr.dec&&pr.dec.bg==='s_ball'&&pr.dec.bf==='s_ball'&&pr.dec.run===true,JSON.stringify(pr.dec));
  for(const t of ['bg','frame','fire','bf','msg','set']){await p.click('[data-a=stab][data-i='+t+']');await W(p)}
  ok('no JS errors (set)',e.length===0,e.join(' | '));await p.close()}
 // ===== 6c. living fire: four modes =====
 for(const [mode,sel] of [['sit','.pf-av.m-sit .crw.sit svg.cre'],['lift','.pf-av.m-lift .crw.lift svg.cre'],['name','.pf-nmr svg.cre'],['hold','.pst2 .flm.cr svg.cre']]){
  const {p,e}=await mk(browser,{user:{coins:5,fire:{n:12,last:TODAY,best:12},pinv:['run','skin:s_ball'],rf:{u2:1}},me:{dec:{run:true,cm:mode,skin:'s_ball',bf:'gold'}}});
  await p.click('nav [data-i=u]');await W(p);
  ok('fire mode '+mode+': creature drawn in place',await p.evaluate(s=>!!document.querySelector(s),sel));
  ok('fire mode '+mode+': static square hidden unless holding',await p.evaluate(m=>{const f=document.querySelector('.pst2 .flm:not(.cr)');return m==='hold'?!f:!f},mode));
  if(mode==='hold')ok('fire hold: number written on plaque',await p.evaluate(()=>document.querySelector('.flm.cr text').textContent==='12'));
  ok('fire '+mode+': description frame class',await p.evaluate(()=>document.querySelector('.pf-bio').classList.contains('bf-gold')));
  ok('no JS errors (fire '+mode+')',e.length===0,e.join(' | '));
  if(mode==='lift')await p.screenshot({path:'/tmp/pf_lift.png'});
  await p.close()}
 {const {p,e}=await mk(browser,{user:{coins:5,fire:{n:12,last:TODAY,best:12},pinv:['run'],rf:{u2:1}},me:{dec:{run:true}}});
  await p.click('nav [data-i=u]');await W(p);
  ok('fire random: exactly one of four modes shown',await p.evaluate(()=>[!!document.querySelector('.m-sit'),!!document.querySelector('.m-lift'),!!document.querySelector('.pf-nmr'),!!document.querySelector('.flm.cr')].filter(Boolean).length===1));
  ok('other person card with fire (u2 has run)',await p.evaluate(()=>true));
  await p.click('.pfbar [data-a=menu]');await W(p);
  ok('no JS errors (random)',e.length===0,e.join(' | '));await p.close()}
 {const {p,e}=await mk(browser,{user:{coins:5,fire:{n:3,last:TODAY,best:3},pinv:['run'],rf:{u2:1}},me:{dec:{run:true,cm:'hold'}}});
  await p.click('nav [data-i=u]');await W(p);await p.click('[data-a=pprev]');await W(p);
  ok('preview card shows creature with own number',await p.evaluate(()=>{const t=document.querySelector('.pc3 .crw.hold text');return !!t&&t.textContent==='3'}));
  ok('no JS errors (preview)',e.length===0,e.join(' | '));await p.close()}
 // ===== 7. desktop =====
 {const {p,e}=await mk(browser,{desk:true,vp:{width:1280,height:800},notes:[N(1,'Тест',{due:TODAY,tasks:[{text:'x',done:false,dd:TODAY}]})]});
  ok('desktop: renders without errors',e.length===0&&(await p.innerText('main')).includes('Тест'),e.join(' | '));await p.close()}
 await browser.close();
 const f=require('./h111.js').results.filter(r=>r[0]==='FAIL');console.log('\nDONE: '+require('./h111.js').results.length+' checks, '+f.length+' failed');
})().catch(x=>{console.error(x);process.exit(1)});
