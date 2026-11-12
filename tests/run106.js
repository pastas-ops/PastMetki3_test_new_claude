// Тесты версии 1.0.6 (запуск из папки tests: node run106.js)
const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('../www/index.html','utf8');
const M={app:fs.readFileSync('mock-app.js','utf8'),auth:fs.readFileSync('mock-auth.js','utf8'),fs:fs.readFileSync('mock-fs.js','utf8')};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const add=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
const results=[];const ok=(n,c,extra="")=>{results.push([c?"PASS":"FAIL",n,extra]);if(!c)console.log("FAIL |",n,"|",String(extra).slice(0,300))};
const seed=(a)=>{const now=Date.now(),D=864e5;
 window.__FB={user:{uid:'u1',email:'x'},db:{
  'profiles/u1':{name:'Алексей',login:'alex',av:'',inv:'ABC123'},
  'profiles/u2':{name:'Аня',login:'anya',av:'',inv:'ZZZ'},
  'profiles/u3':{name:'Борис',login:'boris',av:'',inv:'YYY'},
  'users/u1':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.0.10'},rd:{},sq:[],hist:[],notes:[
    {id:now-5000,title:'Бета',tasks:[{text:'a',done:true},{text:'b',done:false},{text:'c',done:false},{text:'d',done:false}],done:false,due:a.today,dtm:'18:30',cat:'work',body:''},
    {id:now-4000,title:'Альфа',tasks:[],done:false,due:a.d3,cat:'work',body:''},
    {id:now-3000,title:'Яблоко',tasks:[],done:false,due:'',cat:'shop',body:''},
    {id:now-2000,title:'Старая без категории',tasks:[],done:false,due:a.dm,body:''}]},
  'chats/u1|u2':{members:['u1','u2'],on:true,last:{x:'Привет',ts:now,f:'u2'}},
  'chats/u1|u3':{members:['u1','u3'],on:true,last:null},
  'chats/u1|u2/msgs/m0':{f:'u2',x:'Давно',k:[],dn:false,ts:now-3*D,due:''},
  'chats/u1|u2/msgs/m1':{f:'u2',x:'Привет',k:[{text:'Пункт A',done:false}],dn:false,ts:now,due:''},
  'shared/s1':{members:['u1','u2'],x:'Чужая общая',k:[],due:a.d3,done:false,cid:'u1|u2',ts:now}
 }};
 window.__CAP={handlers:{},sent:[]};
 window.Capacitor={isNativePlatform:()=>true,registerPlugin:()=>({setData:async o=>{window.__CAP.sent.push(o)},getPending:async()=>({ops:'[]'})}),Plugins:{App:{addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},getLaunchUrl:async()=>({url:null}),minimizeApp:()=>{}}}};
};
async function mk(browser){const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const e=[];
 p.on('pageerror',x=>e.push('pageerror: '+x.message));p.on('console',m=>{if(m.type()==='error')e.push('console: '+m.text())});
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"version":"1.0.10","min":"1.0.0"}'});if(/manifest\.webmanifest|sw\.js|icon-\d+\.png/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
 await p.addInitScript(seed,{today:add(0),d3:add(3),dm:add(-2)});await p.goto('http://pm.test/');await p.waitForTimeout(600);return{p,e,ctx}}
(async()=>{
 const browser=await chromium.launch();const {p:page,e:errs}=await mk(browser);
 const txt=()=>page.innerText('body'),db=(k)=>page.evaluate(k=>window.__FB.db[k],k);
 // ---- HOME: percent by plan items, customization
 await page.waitForTimeout(1300);let t=await txt();
 ok('home: percent counts plan items (1 of 4 = 25%)',t.includes('25%')&&t.includes('1 из 4'),t.slice(0,200));
 await page.click('[data-a=hmc]');await page.waitForTimeout(250);
 ok('home: customize dialog opens',await page.$('dialog[open] [data-a=hmt]')!==null);
 await page.click('dialog [data-a=hmt][data-i=pct]');await page.waitForTimeout(200);
 await page.click('dialog [data-a=hmt][data-i=up]');await page.waitForTimeout(200);
 await page.click('dialog [data-a=hqs][data-i=chat]');await page.waitForTimeout(200);
 await page.click('dialog [data-a=hqs][data-i=search]');await page.waitForTimeout(200);
 await page.click('dialog [data-a=fx]');await page.waitForTimeout(250);t=await txt();
 ok('home: hidden blocks gone',!t.includes('25%')&&!t.includes('Предстоящие задачи')&&t.includes('Сегодня'),t.slice(0,200));
 const hm=(await db('users/u1')).s.hm;ok('home: settings saved to DB',hm&&hm.pct===0&&hm.up===0&&hm.qs.includes('search')&&!hm.qs.includes('chat'),JSON.stringify(hm));
 ok('home: quick actions customised',await page.$('.qa [data-i=search]')!==null&&await page.$('.qa [data-i=chat]')===null);
 ok('home: today row shows deadline time',(await page.innerText('.trow:has-text("Бета")')).includes('18:30'));
 // ---- NOTES: sort, categories, back navigation
 await page.click('nav [data-i=n]');await page.waitForTimeout(400);
 await page.click('.chips [data-i=work]');await page.waitForTimeout(300);
 ok('category view has back arrow',await page.$('[data-a=ncat0]')!==null);
 let titles=await page.$$eval('#sres .card .tt',e=>e.map(x=>x.firstChild.textContent.trim()));
 ok('sort default: newest first',titles[0]==='Альфа'&&titles[1]==='Бета',titles.join(','));
 await page.click('[data-a=srt]');await page.waitForTimeout(200);await page.click('dialog [data-a=srts][data-i=name]');await page.waitForTimeout(300);
 titles=await page.$$eval('#sres .card .tt',e=>e.map(x=>x.firstChild.textContent.trim()));
 ok('sort by name A-Z',titles[0]==='Альфа'&&titles[1]==='Бета',titles.join(','));
 await page.click('[data-a=srt]');await page.waitForTimeout(200);await page.click('dialog [data-a=srts][data-i=due]');await page.waitForTimeout(300);
 titles=await page.$$eval('#sres .card .tt',e=>e.map(x=>x.firstChild.textContent.trim()));
 ok('sort by deadline (today first)',titles[0]==='Бета'&&titles[1]==='Альфа',titles.join(','));
 ok('sort persisted',(await db('users/u1')).s.srt==='due');
 await page.evaluate(()=>window.__CAP.handlers.backButton());await page.waitForTimeout(500);
 ok('hardware back leaves category (still on notes tab)',await page.$('[data-a=ncat0]')===null&&(await txt()).includes('Добавить категорию'));
 await page.click('.chips [data-i=work]');await page.waitForTimeout(300);await page.click('[data-a=ncat0]');await page.waitForTimeout(500);
 ok('arrow leaves category',await page.$('[data-a=ncat0]')===null);
 // swipe back
 await page.click('.chips [data-i=work]');await page.waitForTimeout(300);
 await page.evaluate(()=>{const mk=(x,y)=>new Touch({identifier:1,target:document.querySelector('.pg'),clientX:x,clientY:y});const f=(n,x,y)=>document.querySelector('.pg').dispatchEvent(new TouchEvent(n,{bubbles:true,cancelable:true,touches:n==='touchend'?[]:[mk(x,y)],changedTouches:[mk(x,y)]}));f('touchstart',40,400);f('touchmove',100,402);f('touchmove',200,404);f('touchend',200,404)});
 await page.waitForTimeout(700);ok('swipe right leaves category',await page.$('[data-a=ncat0]')===null);
 // add category
 await page.click('[data-a=cnew]');await page.waitForTimeout(250);
 await page.click('[data-a=csv]');await page.waitForTimeout(150);ok('category: empty name rejected',await page.$('dialog[open]')!==null);
 await page.fill('dialog [data-m=cn]','Спорт');await page.click('dialog [data-a=ccol][data-i="3"]');await page.click('dialog [data-a=cic][data-i=heart]');await page.click('dialog [data-a=csv]');await page.waitForTimeout(400);
 let cats=(await db('users/u1')).cats;ok('category added',cats&&cats.length===6&&cats[5].n==='Спорт'&&cats[5].ic==='heart',JSON.stringify(cats&&cats[5]));
 ok('category card shown',(await txt()).includes('Спорт'));
 // new note form: no body field, categories incl. new one, time field
 await page.click('[data-a=qa][data-i=note]');await page.waitForTimeout(450);
 ok('form: no "Заметка (необязательно)" field',await page.$('textarea[data-m=b]')===null&&!(await txt()).includes('необязательно'));
 ok('form: custom category chip present',(await page.$$eval('[data-a=dcat]',e=>e.map(x=>x.innerText))).some(x=>x.includes('Спорт')));
 ok('form: time input present',await page.$('[data-m=dt]')!==null);
 await page.fill('[data-m=t]','С временем');await page.fill('[data-m=d]',add(1));await page.fill('[data-m=dt]','09:15');await page.click('[data-a=add]');await page.waitForTimeout(600);
 const nt=(await db('users/u1')).notes.find(n=>n.title==='С временем');ok('note saved with time',nt&&nt.dtm==='09:15'&&nt.due===add(1),JSON.stringify(nt));
 // delete category -> notes move to "Без категории"
 await page.evaluate(()=>{});
 await page.click('.cc[data-i=shop]',{delay:700});await page.waitForTimeout(1000);
 ok('long-press category opens editor',await page.$('dialog[open] [data-a=cdel]')!==null);
 page.once('dialog',d=>d.accept());await page.click('dialog [data-a=cdel]');await page.waitForTimeout(500);
 ok('category deleted, orphan card appears',!(await txt()).includes('Покупки')&&(await txt()).includes('Без категории'),(await txt()).slice(0,300));
 // ---- CALENDAR: hide foreign shared note
 await page.click('nav [data-i=c]');await page.waitForTimeout(450);
 ok('calendar shows shared note',(await txt()).includes('Чужая общая'));
 page.once('dialog',d=>d.accept());await page.click('[data-a=shd]');await page.waitForTimeout(500);
 ok('shared note removed from my calendar',!(await txt()).includes('Чужая общая'));
 ok('hidden id saved, shared doc kept for others',(await db('users/u1')).hs.includes('s1')&&!!(await db('shared/s1')));
 // ---- CHAT: separators, jump calendar, fixed composer
 await page.click('nav [data-i=s]');await page.waitForTimeout(400);await page.click('[data-a=chat][data-i=u2]');await page.waitForTimeout(700);
 const seps=await page.$$eval('.dsep',e=>e.map(x=>x.innerText));ok('chat: two date separators',seps.length===2,seps.join(' | '));
 ok('chat: separator is "1 ноября" style (no clock)',/^\d{1,2} [а-я]+$/.test(seps[0]),seps[0]);
 ok('chat: bubble footer shows only time',/\d\d:\d\d/.test(await page.innerText('.msg .sm:last-child'))&&!/\d\d\.\d\d\s\d\d:\d\d/.test(await page.innerText('.msg')));
 const pos1=await page.evaluate(()=>{const c=document.querySelector('.cw').getBoundingClientRect();return{b:Math.round(c.bottom),h:innerHeight,pos:getComputedStyle(document.querySelector('.cw')).position}});
 ok('composer is position:fixed at the bottom',pos1.pos==='fixed'&&Math.abs(pos1.b-pos1.h)<=2,JSON.stringify(pos1));
 await page.evaluate(()=>{const l=document.querySelector('#mlist');for(let i=0;i<40;i++){const d=document.createElement('div');d.style.height='60px';d.textContent='x';l.appendChild(d)}scrollTo(0,0)});await page.waitForTimeout(200);
 const pos2=await page.evaluate(()=>{const c=document.querySelector('.cw').getBoundingClientRect();return Math.round(c.bottom)});ok('composer stays put while scrolling up',Math.abs(pos2-pos1.b)<=2,pos2+' vs '+pos1.b);
 await page.evaluate(()=>{scrollTo(0,0)});
 await page.click('.dsep >> nth=0');await page.waitForTimeout(300);
 ok('tap on date opens calendar with message days',(await page.$$('dialog[open] .cal .y')).length===2);
 await page.click('dialog[open] .cal .y >> nth=0');await page.waitForTimeout(600);ok('jump closes calendar',await page.$('dialog[open]')===null);
 // time button in composer
 ok('composer: time button present',await page.$('[data-m=cdtm]')!==null);
 await page.fill('[data-m=ct]','Дедлайн с временем');await page.fill('[data-m=cdt]',add(2));await page.fill('[data-m=cdtm]','14:05');
 ok('composer caption has time',(await page.innerText('#dcap')).includes('14:05'));
 await page.click('[data-a=send]');await page.waitForTimeout(500);
 const mm=await page.evaluate(()=>Object.values(window.__FB.db).filter(v=>v&&v.x==='Дедлайн с временем'));ok('message and shared doc saved with dtm',mm.length===2&&mm.every(z=>z.dtm==='14:05'),JSON.stringify(mm));
 // ---- OFFLINE banner
 await page.context().setOffline(true);await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await page.waitForTimeout(300);
 ok('offline banner in chats',(await txt()).includes('Нет интернета'));
 await page.fill('[data-m=ct]','не уйдёт');await page.click('[data-a=send]');await page.waitForTimeout(300);
 ok('offline: sending blocked with message',!(await page.evaluate(()=>Object.values(window.__FB.db).some(v=>v&&v.x==='не уйдёт'))));
 await page.context().setOffline(false);await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.waitForTimeout(2800);
 ok('banner disappears when online',!(await txt()).includes('Нет интернета'));
 await page.click('[data-a=back]');await page.waitForTimeout(500);
 // ---- GROUPS
 await page.click('[data-a=grp]');await page.waitForTimeout(300);
 await page.click('dialog [data-a=gmk]');await page.waitForTimeout(200);ok('group: name required',await page.$('dialog[open] [data-a=gmk]')!==null);
 await page.fill('dialog [data-m=gn]','Команда');await page.click('dialog [data-a=gmk]');await page.waitForTimeout(200);
 ok('group: at least one member required',await page.$('dialog[open] [data-a=gmk]')!==null&&!(await page.evaluate(()=>Object.keys(window.__FB.db).some(k=>k.startsWith('groups/')))));
 await page.click('dialog [data-a=gsel][data-i=u2]');await page.click('dialog [data-a=gsel][data-i=u3]');await page.waitForTimeout(200);
 ok('group: name kept after picking members',(await page.inputValue('dialog [data-m=gn]'))==='Команда');
 await page.click('dialog [data-a=gmk]');await page.waitForTimeout(900);
 const gk=await page.evaluate(()=>Object.keys(window.__FB.db).find(k=>/^groups\/[^/]+$/.test(k)));const g=await db(gk);
 ok('group created: only owner is a member until invites are accepted',g&&g.owner==='u1'&&g.members.length===1&&g.name==='Команда',JSON.stringify(g));
 ok('group chat opened with title and member count',(await page.innerText('header')).includes('Команда')&&(await page.innerText('header')).includes('1 участник'));
 ok('invitations created for both friends',await page.evaluate(()=>Object.keys(window.__FB.db).filter(k=>k.startsWith('ginv/')).length)===2);
 await page.fill('[data-m=ct]','Привет, группа');await page.fill('[data-m=cdt]',add(4));await page.click('[data-a=send]');await page.waitForTimeout(500);
 const gid=gk.split('/')[1];
 const gm=await page.evaluate(id=>Object.entries(window.__FB.db).filter(([k,v])=>k.startsWith('groups/'+id+'/msgs/')).map(x=>x[1]),gid);
 ok('group message stored in group',gm.length===1&&gm[0].x==='Привет, группа');
 const sh=await page.evaluate(()=>Object.values(window.__FB.db).find(v=>v&&v.x==='Привет, группа'&&v.gid));
 ok('group deadline shared with group name, no logins',sh&&sh.gn==='Команда'&&sh.members.length===1,JSON.stringify(sh));
 await page.click('nav',{trial:true}).catch(()=>{});
 await page.click('[data-a=back]');await page.waitForTimeout(500);
 t=await txt();ok('chat list shows group',t.includes('Команда')&&t.includes('1 участник'));
 await page.click('nav [data-i=c]');await page.waitForTimeout(450);t=await txt();
 ok('calendar shows group name as creator',t.includes('Привет, группа')&&t.includes('👥 Команда')&&!t.includes('@boris'),t.slice(0,300));
 await page.click('nav [data-i=s]');await page.waitForTimeout(400);
 await page.click('[data-a=chat][data-i^=g_]');await page.waitForTimeout(600);
 await page.click('header [data-a=ginfo] >> nth=0');await page.waitForTimeout(300);
 ok('group info: owner crown, pending invites listed',(await page.innerText('dialog')).includes('👑')&&(await page.innerText('dialog')).includes('Ожидают ответа'));
 await page.click('dialog [data-a=fx]');await page.waitForTimeout(200);
 // long-press on header avatar opens info
 await page.click('header [data-lt=g]',{delay:700});await page.waitForTimeout(900);ok('long-press on group avatar opens info',await page.$('dialog[open] [data-a=gdel]')!==null);
 await page.click('dialog [data-a=fx]');
 // widget payload carries progress + done flag
 await page.waitForTimeout(1500);
 const last=await page.evaluate(()=>window.__CAP.sent[window.__CAP.sent.length-1]);
 ok('widget payload has prog and note done flag',last&&last.prog&&JSON.parse(last.notes).every(n=>'d' in n),JSON.stringify(last).slice(0,200));
 ok('no JS errors during the whole run',errs.length===0,errs.join(' | '));
 await browser.close();
 const bad=results.filter(r=>r[0]==='FAIL');console.log(results.map(r=>r.join(' | ')).join('\n'));console.log('\nTOTAL',results.length,'FAILED',bad.length);
})();
