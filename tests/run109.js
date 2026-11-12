// Тесты версии 1.0.10 (запуск из папки tests: node run109.js)
const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('../www/index.html','utf8');
const M={app:fs.readFileSync('mock-app.js','utf8'),auth:fs.readFileSync('mock-auth.js','utf8'),fs:fs.readFileSync('mock-fs.js','utf8')};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const add=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
const results=[];const ok=(n,c,extra='')=>{results.push([c?'PASS':'FAIL',n,extra]);if(!c)console.log('FAIL |',n,'|',String(extra).slice(0,300))};
const seed=(a)=>{const now=Date.now();
 window.__PREF={};window.__SYNC=[];window.__OPEN=[];window.__DL=[];
 window.__FB={user:{uid:'u1',email:'x'},db:{
  'profiles/u1':{name:'Алексей',login:'alex',av:'',inv:'ABC123'},'profiles/u2':{name:'Аня',login:'anya',av:'',inv:'ZZZ'},'profiles/u3':{name:'Борис',login:'boris',av:'',inv:'YYY'},
  'users/u1':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',...(a.s||{})},rd:{},sq:[],hist:[],notes:a.notes||[]},
  'chats/u1|u2':{members:['u1','u2'],on:true,last:{x:'Привет',ts:now-1000,f:'u2'}},
  'chats/u1|u3':{members:['u1','u3'],on:true,last:null},
  'groups/g1':{name:'Клуб',av:'',owner:'u1',members:['u1','u2'],muted:[],ts:1,last:null},
  ...(a.extra||{})}};
 window.__CAP={handlers:{},sent:[]};
 window.Capacitor={isNativePlatform:()=>true,
  registerPlugin:()=>({setData:async o=>{window.__CAP.sent.push(o)},getPending:async()=>({ops:'[]'}),setSync:async o=>{window.__SYNC.push(o)},diag:async()=>({widgets:2,notes:3,sync:true,saved:1}),download:async o=>{window.__DL.push(o)}}),
  Plugins:{App:{addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},getLaunchUrl:async()=>({url:null}),minimizeApp:()=>{},openUrl:async o=>{window.__OPEN.push(o.url)}},
   Preferences:{set:async({key,value})=>{window.__PREF[key]=value},get:async({key})=>({value:window.__PREF[key]===undefined?null:window.__PREF[key]})},
   LocalNotifications:{schedule:async()=>{},getPending:async()=>({notifications:[]}),cancel:async()=>{},requestPermissions:async()=>({}),addListener:()=>{}}}};
};
let VJ={version:'1.0.10',min:'1.0.0',apk:'',page:'',notes:['a']};
async function mk(browser,o={}){const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});const p=await ctx.newPage();const e=[];
 p.on('pageerror',x=>e.push('pageerror: '+x.message));p.on('console',m=>{if(m.type()==='error')e.push('console: '+m.text())});
 const vj=o.vj||VJ;
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return o.vfail?r.abort():r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(vj)});if(/manifest\.webmanifest|sw\.js|icon-\d+\.png/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
 await p.addInitScript(seed,o);await p.goto('http://pm.test/');await p.waitForTimeout(o.wait||900);return{p,e}}
const N=(id,title,o={})=>({id,title,tasks:[],done:false,due:'',cat:'work',body:'',...o});
(async()=>{
 const browser=await chromium.launch();const T=add(0);
 // ===== 1. quick-action chats =====
 {const {p,e}=await mk(browser,{s:{lv:'1.0.10'},notes:[N(1,'С планом',{due:T,tasks:[{text:'a',done:false}]})]});
  ok('home: arrow is the right-most control of a row, no pencil',await p.evaluate(()=>{const r=document.querySelector('.trow');return r.lastElementChild.dataset.a==='hexp'&&!r.querySelector('[data-a=hed]')}));
  await p.click('[data-a=hmc]');await p.waitForTimeout(300);
  const chips=await p.$$eval('dialog [data-a=hqs]',x=>x.map(y=>y.innerText));
  ok('customize: chats and groups offered as quick actions',chips.includes('Аня')&&chips.includes('Борис')&&chips.includes('Клуб'),chips.join('|'));
  await p.click('dialog [data-a=hqs]:has-text("Аня")');await p.click('dialog [data-a=hqs]:has-text("Клуб")');await p.click('dialog [data-a=hqs]:has-text("Борис")');await p.waitForTimeout(200);
  await p.click('dialog [data-a=fx]');await p.waitForTimeout(300);
  const qs=await p.evaluate(()=>window.__FB.db['users/u1'].s.hm.qs);
  ok('several chats can be added (saved)',qs.includes('c:u2')&&qs.includes('c:u3')&&qs.includes('c:g_g1'),JSON.stringify(qs));
  const names=await p.$$eval('.qa .qb',x=>x.map(y=>y.innerText.trim()));
  ok('chat quick actions shown by name',names.some(n=>n.includes('Аня'))&&names.some(n=>n.includes('Клуб'))&&names.some(n=>n.includes('Борис')),names.join('|'));
  await p.click('.qb[data-q="c:u2"]');await p.waitForTimeout(800);
  ok('tap on a chat quick action opens that chat',(await p.innerText('header')).includes('Аня'));
  await p.click('[data-a=back]');await p.waitForTimeout(500);await p.click('nav [data-i=m]');await p.waitForTimeout(500);
  await p.click('.qb[data-q="c:g_g1"]');await p.waitForTimeout(800);
  ok('tap on a group quick action opens that group',(await p.innerText('header')).includes('Клуб'));
  await p.click('[data-a=back]');await p.waitForTimeout(500);await p.click('nav [data-i=m]');await p.waitForTimeout(500);
  await p.click('[data-a=hmc]');await p.waitForTimeout(300);await p.click('dialog [data-a=hqs]:has-text("Борис")');await p.click('dialog [data-a=fx]');await p.waitForTimeout(300);
  ok('chat quick action can be removed again',!(await p.evaluate(()=>window.__FB.db['users/u1'].s.hm.qs)).includes('c:u3')&&await p.$('.qb[data-q="c:u3"]')===null);
  ok('no JS errors (quick chats)',e.length===0,e.join(' | '));await p.close()}
 // ===== 2. invitations: pending / re-send =====
 {const {p,e}=await mk(browser,{s:{lv:'1.0.10'},extra:{'ginv/g1_u3':{gid:'g1',gn:'Клуб',ga:'',from:'u1',to:'u3',ts:5}}});
  await p.click('nav [data-i=s]');await p.waitForTimeout(400);await p.click('[data-a=chat][data-i=g_g1]');await p.waitForTimeout(500);
  await p.click('header [data-a=ginfo] >> nth=0');await p.waitForTimeout(300);await p.click('dialog [data-a=ginvm]');await p.waitForTimeout(300);
  let t=await p.innerText('dialog');
  ok('picker: invited-but-not-answered friend is labelled "ждёт ответа" and not selectable',t.includes('Борис')&&t.includes('ждёт ответа')&&(await p.$$('dialog [data-a=gsel]')).length===0,t);
  ok('picker: group member labelled "Уже в группе"',t.includes('Аня')&&t.includes('Уже в группе'));
  ok('picker: pending invite can be revoked',await p.$('dialog [data-a=ginvx]')!==null);
  await p.click('dialog [data-a=ginvx]');await p.waitForTimeout(500);
  ok('revoke deletes the invitation',!(await p.evaluate(()=>window.__FB.db['ginv/g1_u3'])));
  ok('after revoke/decline the friend can be invited again',(await p.$$('dialog [data-a=gsel]')).length===1);
  await p.click('dialog [data-a=gsel]');await p.click('dialog [data-a=ginv2]');await p.waitForTimeout(500);
  const inv=await p.evaluate(()=>window.__FB.db['ginv/g1_u3']);ok('invitation re-sent',inv&&inv.from==='u1'&&inv.to==='u3',JSON.stringify(inv));
  ok('no JS errors (invites)',e.length===0,e.join(' | '));await p.close()}
 // ===== 3. what's new =====
 {const {p,e}=await mk(browser,{notes:[]});await p.waitForTimeout(900);
  ok('what\'s new opens after login for a new version',(await p.innerText('dialog[open]')).includes('Что нового в 1.0.10')&&(await p.innerText('dialog[open]')).includes('Устранены некоторые ошибки'));
  ok('what\'s new: auto-close countdown shown',(await p.innerText('dialog[open]')).includes('закроется через'));
  ok('what\'s new: marked as seen for this version',(await p.evaluate(()=>window.__FB.db['users/u1'].s.lv))==='1.0.10');
  await p.waitForTimeout(2300);const ct=await p.innerText('#chgt');ok('countdown ticks down',/через (2[5-9]) с/.test(ct),ct);
  await p.click('dialog [data-a=fx] >> nth=0');await p.waitForTimeout(300);ok('closes with the cross',await p.$('dialog[open]')===null);
  await p.click('nav [data-i=u]');await p.waitForTimeout(500);
  await p.click('[data-a=chg]');await p.waitForTimeout(300);
  ok('tap on version in settings reopens the same text (no countdown)',(await p.innerText('dialog[open]')).includes('Что нового в 1.0.10')&&await p.$('#chgt')===null);
  ok('no JS errors (what\'s new)',e.length===0,e.join(' | '));await p.close()}
 {const {p}=await mk(browser,{s:{lv:'1.0.10'},notes:[]});await p.waitForTimeout(500);ok('what\'s new is not shown again for the same version',await p.$('dialog[open]')===null);await p.close()}
 // auto close after 30 s using a fake clock
 {const ctx=await browser.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
  if(p.clock&&p.clock.install){await p.clock.install();
   await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(VJ)});if(/manifest|sw\.js|icon-/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
   await p.addInitScript(seed,{notes:[]});await p.goto('http://pm.test/');await p.clock.runFor(2500);
   const open1=await p.$('dialog[open]')!==null;await p.clock.runFor(31000);const open2=await p.$('dialog[open]')!==null;
   ok('what\'s new closes itself after 30 s',open1&&!open2,open1+' '+open2)}
  await ctx.close()}
 // ===== 4. updates =====
 {const {p,e}=await mk(browser,{s:{lv:'1.0.10'},vj:{version:'1.0.11',min:'1.0.0',apk:'',page:'https://t.me/pm_files',notes:['Новая кнопка','Исправления']},notes:[]});await p.waitForTimeout(900);
  ok('update available: dialog with version and notes',(await p.innerText('dialog[open]')).includes('Доступна версия 1.0.11')&&(await p.innerText('dialog[open]')).includes('Новая кнопка'));
  await p.click('dialog [data-a=updgo]');await p.waitForTimeout(300);
  ok('download button opens the channel/page link',(await p.evaluate(()=>window.__OPEN))[0]==='https://t.me/pm_files');
  await p.click('dialog [data-a=updlater]');await p.waitForTimeout(300);
  ok('"later" closes and remembers for today',await p.$('dialog[open]')===null&&(await p.evaluate(()=>window.__FB.db['users/u1'].s.sk)).startsWith('1.0.11@'));
  await p.click('nav [data-i=u]');await p.waitForTimeout(400);await p.click('[data-a=menu]');await p.waitForTimeout(300);await p.click('.mnu [data-a=acs][data-i=set]');await p.waitForTimeout(400);
  await p.click('[data-a=updchk]');await p.waitForTimeout(800);ok('manual check shows update even after "later"',(await p.innerText('dialog[open]')).includes('Доступна версия 1.0.11'));
  ok('no JS errors (update)',e.length===0,e.join(' | '));await p.close()}
 {const {p}=await mk(browser,{s:{lv:'1.0.10'},vj:{version:'1.0.11',min:'1.0.0',apk:'https://example.com/pm.apk',page:'',notes:[]},notes:[]});await p.waitForTimeout(700);
  await p.click('dialog [data-a=updgo]');await p.waitForTimeout(300);
  const dl=await p.evaluate(()=>window.__DL);ok('direct APK link is handed to the native downloader',dl.length===1&&dl[0].url==='https://example.com/pm.apk'&&/PastMetki-1\.0\.11\.apk/.test(dl[0].name),JSON.stringify(dl));await p.close()}
 {const {p}=await mk(browser,{s:{lv:'1.0.10',au:0},vj:{version:'1.0.11',min:'1.0.0',apk:'',page:'x',notes:[]},notes:[]});await p.waitForTimeout(700);
  ok('auto-check can be switched off (no dialog)',await p.$('dialog[open]')===null);await p.close()}
 {const {p}=await mk(browser,{s:{lv:'1.0.10'},vj:{version:'1.0.11',min:'1.0.11',apk:'',page:'https://t.me/pm_files',notes:['Важно']},notes:[]});await p.waitForTimeout(900);
  ok('old version is blocked: full-screen gate with download button',await p.$('#gate [data-a=updgo]')!==null&&(await p.innerText('#gate')).includes('Нужно обновить'));
  const top=await p.evaluate(()=>{const g=document.querySelector('#gate').getBoundingClientRect(),e=document.elementFromPoint(195,300);return{full:g.width>=380&&g.height>=800,covers:!!e.closest('#gate')}});
  ok('gate covers the whole app (nothing underneath is clickable)',top.full&&top.covers,JSON.stringify(top));
  await p.click('#gate [data-a=updgo]');await p.waitForTimeout(300);ok('gate: button opens the download link',(await p.evaluate(()=>window.__OPEN))[0]==='https://t.me/pm_files');await p.close()}
 {const {p}=await mk(browser,{s:{lv:'1.0.10'},vfail:true,notes:[]});await p.waitForTimeout(900);
  ok('no connection to the version file: app works normally',await p.$('#gate')===null&&await p.$('dialog[open]')===null&&(await p.innerText('body')).includes('Привет, Алексей'));await p.close()}
 // ===== 5. widget data path through Preferences =====
 {const {p,e}=await mk(browser,{s:{lv:'1.0.10'},notes:[N(1,'Сегодня',{due:T,tasks:[{text:'a',done:true},{text:'b',done:false}]}),N(2,'Просто',{})]});await p.waitForTimeout(1800);
  const pref=await p.evaluate(()=>window.__PREF);
  ok('widgets: notes/progress written through Preferences plugin',pref.pm_notes&&JSON.parse(pref.pm_notes).length===2&&JSON.parse(pref.pm_prog).p===50&&JSON.parse(pref.pm_prog).n===2,JSON.stringify(pref).slice(0,200));
  ok('widgets: background-sync credentials written (uid + token)',pref.pm_sy&&JSON.parse(pref.pm_sy).uid==='u1'&&JSON.parse(pref.pm_sy).rt==='rt123');
  ok('widgets: custom plugin path still used as well',(await p.evaluate(()=>window.__CAP.sent.length))>=1);
  await p.evaluate(()=>{window.__PREF.pm_ops=JSON.stringify([{id:2,done:true}])});await p.evaluate(()=>window.__CAP.handlers.appStateChange({isActive:true}));await p.waitForTimeout(700);
  ok('widget tick (from Preferences storage) is applied to the note',(await p.evaluate(()=>window.__FB.db['users/u1'].notes.find(n=>n.id===2).done))===true&&(await p.evaluate(()=>window.__PREF.pm_ops))==='[]');
  await p.click('nav [data-i=u]');await p.waitForTimeout(400);await p.click('[data-a=menu]');await p.waitForTimeout(300);await p.click('.mnu [data-a=acs][data-i=set]');await p.waitForTimeout(400);await p.click('[data-a=wdg]');await p.waitForTimeout(2200);
  const t=await p.innerText('body');ok('widget check button prints a readable status',t.includes('Виджеты:')&&t.includes('Preferences: есть')&&t.includes('виджетов на экране: 2'),t.slice(t.indexOf('Виджеты:'),t.indexOf('Виджеты:')+200));
  ok('no JS errors (widgets)',e.length===0,e.join(' | '));await p.close()}
 await browser.close();
 const bad=results.filter(r=>r[0]==='FAIL');console.log('TOTAL',results.length,'FAILED',bad.length);
})();
