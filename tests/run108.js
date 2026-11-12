// Тесты версии 1.0.8 (запуск из папки tests: node run108.js)
const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('../www/index.html','utf8');
const M={app:fs.readFileSync('mock-app.js','utf8'),auth:fs.readFileSync('mock-auth.js','utf8'),fs:fs.readFileSync('mock-fs.js','utf8')};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const add=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
const results=[];const ok=(n,c,extra='')=>{results.push([c?'PASS':'FAIL',n,extra]);if(!c)console.log('FAIL |',n,'|',String(extra).slice(0,300))};
const seed=(a)=>{const now=Date.now();
 window.__LN=[];window.__SYNC=[];
 window.__FB={user:{uid:'u1',email:'x'},db:{
  'profiles/u1':{name:'Алексей',login:'alex',av:'',inv:'ABC123'},'profiles/u2':{name:'Аня',login:'anya',av:'',inv:'ZZZ'},'profiles/u3':{name:'Борис',login:'boris',av:'',inv:'YYY'},
  'users/u1':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.0.10'},rd:{},sq:[],hist:[],notes:a.notes},
  'chats/u1|u2':{members:['u1','u2'],on:true,last:{x:'Привет',ts:now-1000,f:'u2'}},
  'chats/u1|u3':{members:['u1','u3'],on:true,last:null},
  'chats/u1|u2/msgs/m0':{f:'u2',x:'Давно',k:[],dn:false,ts:now-3*864e5,due:''},
  'chats/u1|u2/msgs/m1':{f:'u2',x:'Привет',k:[],dn:false,ts:now-1000,due:''},
  'groups/g1':{name:'Клуб',av:'',owner:'u1',members:['u1','u2'],muted:[],ts:1,last:null},
  ...(a.extra||{})}};
 window.__CAP={handlers:{},sent:[]};
 window.Capacitor={isNativePlatform:()=>true,
  registerPlugin:()=>({setData:async o=>{window.__CAP.sent.push(o)},getPending:async()=>({ops:'[]'}),setSync:async o=>{window.__SYNC.push(o)},diag:async()=>({widgets:2,notes:3,sync:true,saved:1})}),
  Plugins:{App:{addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},getLaunchUrl:async()=>({url:null}),minimizeApp:()=>{}},
   LocalNotifications:{schedule:async o=>{window.__LN.push(...o.notifications)},getPending:async()=>({notifications:[]}),cancel:async()=>{},requestPermissions:async()=>({}),addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},checkExactNotificationSetting:async()=>({exact_alarm:'granted'})}}};
};
async function mk(browser,o){const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});const p=await ctx.newPage();const e=[];
 p.on('pageerror',x=>e.push('pageerror: '+x.message));p.on('console',m=>{if(m.type()==='error')e.push('console: '+m.text())});
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"version":"1.0.10","min":"1.0.0"}'});if(/manifest\.webmanifest|sw\.js|icon-\d+\.png/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
 await p.addInitScript(seed,o);await p.goto('http://pm.test/');await p.waitForTimeout(800);return{p,e}}
const N=(id,title,o={})=>({id,title,tasks:[],done:false,due:'',cat:'work',body:'',...o});
(async()=>{
 const browser=await chromium.launch();const T=add(0),D5=add(5);
 // ============ 1. progress animation, shared on home, edit on home ============
 {const notes=[N(1,'Личная',{due:T,tasks:[{text:'a',done:true},{text:'b',done:true}],done:true}),N(2,'Будущая',{due:D5,dtm:'14:00'})];
  const {p,e}=await mk(browser,{notes,extra:{'shared/s1':{members:['u1','u2'],x:'Общая сегодня',k:[],due:T,done:false,cid:'u1|u2',ts:1},'shared/s2':{members:['u1','u2'],x:'Общая потом',k:[{text:'п1',done:false}],due:D5,done:false,gid:'g1',gn:'Клуб',ts:2}}});
  const txt=()=>p.innerText('body');await p.waitForTimeout(1500);
  let t=await txt();
  ok('home: shared note due today shown in "Сегодня"',t.includes('Общая сегодня'));
  ok('home: shared note shown in upcoming',t.includes('Общая потом'));
  ok('home: percent includes shared (2 of 3 = 67%)',t.includes('67%')&&t.includes('2 из 3'),t.slice(0,160));
  ok('home: no pencil button, arrow is the last control in the row',await p.$('.trow [data-a=hed]')===null);
  await p.click('.tw:has-text("Будущая") .trow',{delay:800});await p.waitForTimeout(900);
  ok('home: edit dialog opens on long press',await p.$('dialog[open] #et')!==null||await p.$('dialog[open] input')!==null);
  await p.fill('dialog[open] input >> nth=0','Будущая (изм.)');await p.click('dialog [data-a=esv]');await p.waitForTimeout(500);
  ok('home: edit saved',(await p.evaluate(()=>window.__FB.db['users/u1'].notes.find(n=>n.id===2).title))==='Будущая (изм.)'&&(await txt()).includes('Будущая (изм.)'));
  // complete the shared one -> all done -> green check
  await p.click('.tw:has-text("Общая сегодня") .circ');await p.waitForTimeout(1600);
  const full=await p.evaluate(()=>({o:document.querySelector('#ppn').style.opacity,k:document.querySelector('.pk').style.opacity,c:document.querySelector('#pring').style.getPropertyValue('--rc'),p:document.querySelector('#pring').style.getPropertyValue('--p')}));
  ok('progress: all done -> green ring, check visible, number hidden',full.k==='1'&&full.o==='0'&&full.c==='rgb(53,208,127)'&&parseFloat(full.p)===360,JSON.stringify(full));
  await p.click('.tw:has-text("Общая сегодня") .circ');await p.waitForTimeout(1600);
  const back=await p.evaluate(()=>({o:document.querySelector('#ppn').style.opacity,k:document.querySelector('.pk').style.opacity,c:document.querySelector('#pring').style.getPropertyValue('--rc'),t:document.querySelector('#ppn').textContent}));
  ok('progress: undo -> yellow ring again, number back',back.k==='0'&&back.o==='1'&&back.c==='rgb(255,196,0)'&&back.t==='67%',JSON.stringify(back));
  // animation in progress: value changes gradually
  await p.click('.tw:has-text("Общая сегодня") .circ');await p.waitForTimeout(120);
  const mid=await p.evaluate(()=>parseInt(document.querySelector('#ppn').textContent));
  ok('progress: number animates (intermediate value seen)',mid>67&&mid<100,String(mid));
  ok('no JS errors (home)',e.length===0,e.join(' | '));await p.close()}
 // ============ 2. notifications ============
 {const notes=[N(1,'Личная с временем',{due:D5,dtm:'14:00',cat:'study'}),N(2,'Личная без времени',{due:D5,cat:'work'})];
  const {p,e}=await mk(browser,{notes,extra:{'shared/s1':{members:['u1','u2'],x:'Общая',k:[],due:D5,dtm:'10:00',done:false,cid:'u1|u2',ts:1}}});
  await p.waitForTimeout(1600);
  const ln=await p.evaluate(()=>window.__LN);const by=t=>ln.filter(x=>x.title===t);
  ok('reminders: 3 days before for every item',by('Осталось 3 дня до дедлайна').length===3,JSON.stringify(ln.map(x=>x.title)));
  ok('reminders: 1 day before for every item',by('Завтра дедлайн').length===3);
  ok('reminders: 3 hours before + at the deadline when time set (2 items)',by('Через 3 часа дедлайн').length===2&&by('Дедлайн сейчас').length===2);
  ok('reminders: "today" reminder only for item without time',by('Дедлайн сегодня').length===1&&by('Дедлайн сегодня')[0].body==='Личная без времени');
  ok('reminders: day-based ones open the calendar day',by('Осталось 3 дня до дедлайна').every(x=>x.extra&&x.extra.k==='day'&&x.extra.v===D5)&&by('Завтра дедлайн').every(x=>x.extra.k==='day'));
  ok('reminders: same-day personal -> category, shared -> calendar',by('Дедлайн сегодня')[0].extra.k==='cat'&&by('Дедлайн сегодня')[0].extra.c==='work'&&by('Дедлайн сейчас').some(x=>x.body==='Личная с временем'&&x.extra.k==='cat'&&x.extra.c==='study')&&by('Дедлайн сейчас').some(x=>x.body==='Общая'&&x.extra.k==='day'));
  const tap=async x=>{await p.evaluate(x=>window.__CAP.handlers.localNotificationActionPerformed({notification:{extra:x}}),x);await p.waitForTimeout(900)};
  await tap({k:'day',v:D5});ok('tap on 3-day reminder -> calendar on that date',(await p.innerText('body')).includes('Дедлайны на '+D5.split('-').reverse().join('.')));
  await tap({k:'cat',c:'study',v:'1'});ok('tap on same-day reminder -> notes category of the task',await p.$('[data-a=ncat0]')!==null&&(await p.innerText('body')).includes('Личная с временем'));
  await p.evaluate(()=>window.__CAP.handlers.backButton());await p.waitForTimeout(500);
  await tap({k:'chat',v:'u2'});ok('tap on message notification -> that chat',(await p.innerText('header')).includes('Аня'));
  await p.click('[data-a=back]');await p.waitForTimeout(500);
  await tap({k:'chat',v:'g_g1'});ok('tap on message notification -> that group',(await p.innerText('header')).includes('Клуб'));
  await p.click('[data-a=back]');await p.waitForTimeout(500);await p.click('nav [data-i=m]');await p.waitForTimeout(500);
  // incoming message -> generic text
  await p.evaluate(()=>{window.__LN.length=0;window.__FB.db['chats/u1|u2'].last={x:'секретный текст',ts:Date.now()+5,f:'u2'}});
  await p.click('.hi .pbtn');await p.waitForTimeout(300);await p.click('dialog [data-a=fx]');await p.waitForTimeout(100);
  await p.evaluate(()=>0);
  await p.click('nav [data-i=u]');await p.waitForTimeout(400);await p.click('[data-a=menu]');await p.waitForTimeout(300);await p.click('.mnu [data-a=acs][data-i=set]');await p.waitForTimeout(400);await p.click('.sw[data-i=tm]');await p.waitForTimeout(600);
  const m1=await p.evaluate(()=>window.__LN.filter(x=>x.title==='PastMetki'));
  ok('new message notification: generic text, no message content',m1.length>=1&&m1[0].body==='У вас новое сообщение'&&!JSON.stringify(m1).includes('секретный'),JSON.stringify(m1));
  ok('new message notification opens that chat',m1.length&&m1[0].extra&&m1[0].extra.k==='chat'&&m1[0].extra.v==='u2');
  // widget diagnostics button + sync
  ok('background sync registered with token',await p.evaluate(()=>window.__SYNC.some(x=>x.uid==='u1'&&x.rt==='rt123'&&x.on===true&&x.key==='test-key')),JSON.stringify(await p.evaluate(()=>window.__SYNC)));
  await p.click('[data-a=wdg]');await p.waitForTimeout(1800);
  ok('widget check button reports numbers',(await p.innerText('body')).includes('виджетов на экране: 2'));
  ok('no JS errors (notifications)',e.length===0,e.join(' | '));await p.close()}
 // ============ 3. stats ============
 {const notes=[N(1,'Просроченная',{due:add(-2),tasks:[{text:'a',done:false},{text:'b',done:false}]}),N(2,'Обычная',{due:add(4)}),N(3,'Без даты')];
  const {p,e}=await mk(browser,{notes});const st=()=>p.evaluate(()=>{const u=window.__FB.db['users/u1'].st||{},y=(u.y||{})[String(new Date().getFullYear())]||{};return{u,y}});
  await p.waitForTimeout(800);
  let r=await st();ok('stats: friends baseline recorded, no fake "new friends"',r.u.fi===1&&r.u.fs.u2===0&&r.u.fs.u3===0&&(!r.y||!r.y.fr),JSON.stringify(r.u).slice(0,200));
  await p.click('nav [data-i=n]');await p.waitForTimeout(400);
  await p.click('[data-a=qa][data-i=note]');await p.waitForTimeout(400);await p.fill('[data-m=t]','Новая');await p.click('[data-a=add]');await p.waitForTimeout(900);
  r=await st();ok('stats: created notes counted',r.y.nc===1,JSON.stringify(r.y));
  await p.click('.cc[data-i=work]');await p.waitForTimeout(400);
  await p.click('.card:has-text("Просроченная") [data-a=tk][data-j="0"]');await p.waitForTimeout(500);
  r=await st();ok('stats: plan item counted',r.y.ti===1&&(r.y.nd||0)===0,JSON.stringify(r.y));
  await p.click('.card:has-text("Просроченная") [data-a=tk][data-j="1"]');await p.waitForTimeout(500);
  r=await st();ok('stats: done + deadline done + done after deadline',r.y.nd===1&&r.y.dd===1&&r.y.ld===1&&r.y.ti===2,JSON.stringify(r.y));
  await p.click('.card:has-text("Обычная") .circ');await p.waitForTimeout(500);
  r=await st();ok('stats: done on time is not "late"',r.y.nd===2&&r.y.dd===2&&r.y.ld===1,JSON.stringify(r.y));
  await p.click('.card:has-text("Без даты") .circ');await p.waitForTimeout(500);
  r=await st();ok('stats: done without deadline: only "done"',r.y.nd===3&&r.y.dd===2,JSON.stringify(r.y));
  await p.click('.card:has-text("Просроченная") .circ');await p.waitForTimeout(500);
  r=await st();ok('stats: un-completing reverts counters',r.y.nd===2&&r.y.dd===1&&r.y.ld===0,JSON.stringify(r.y));
  await p.click('.card:has-text("Просроченная") .circ');await p.waitForTimeout(500);
  r=await st();ok('stats: re-completing counts again once',r.y.nd===3&&r.y.dd===2&&r.y.ld===1,JSON.stringify(r.y));
  // chat messages
  await p.click('nav [data-i=s]');await p.waitForTimeout(400);await p.click('.card[data-a=chat][data-i=u2]');await p.waitForTimeout(600);
  await p.fill('[data-m=ct]','Ответ');await p.click('[data-a=send]');await p.waitForTimeout(700);
  r=await st();ok('stats: sent messages counted',r.y.ms===1,JSON.stringify(r.y));
  await p.click('[data-a=back]');await p.waitForTimeout(500);
  await p.waitForTimeout(6500);r=await st();
  ok('stats: per-chat message counts for the year',r.y.mt&&r.y.mt['u1|u2']&&r.y.mt['u1|u2'].n>=3&&r.y.mt['g_g1'].n===0,JSON.stringify(r.y.mt));
  const sum=await p.evaluate(()=>window.pmStats());ok('stats: summary (total + busiest chat)',sum.messagesTotal>=3&&sum.messagesBusiestChat.name==='Аня'&&sum.notesCreated===1&&sum.newFriends===0,JSON.stringify(sum));
  ok('no JS errors (stats)',e.length===0,e.join(' | '));await p.close()}
 // ============ 4. search among friends ============
 {const {p,e}=await mk(browser,{notes:[]});
  await p.click('nav [data-i=s]');await p.waitForTimeout(500);
  ok('chats: search field present, all chats listed',await p.$('[data-m=cq]')!==null&&(await p.$$('#clist .card')).length===3);
  await p.fill('[data-m=cq]','бор');await p.waitForTimeout(200);let n=await p.$$eval('#clist .card .tt',x=>x.map(y=>y.innerText));ok('chat search by name (substring, any case)',n.length===1&&n[0].includes('Борис'),n.join('|'));
  await p.fill('[data-m=cq]','@anya');await p.waitForTimeout(200);n=await p.$$eval('#clist .card .tt',x=>x.map(y=>y.innerText));ok('chat search by login (with @)',n.length===1&&n[0].includes('Аня'),n.join('|'));
  await p.fill('[data-m=cq]','клуб');await p.waitForTimeout(200);n=await p.$$eval('#clist .card .tt',x=>x.map(y=>y.innerText));ok('chat search finds groups by name',n.length===1&&n[0].includes('Клуб'));
  await p.fill('[data-m=cq]','zzz');await p.waitForTimeout(200);ok('chat search: nothing found message',(await p.innerText('#clist')).includes('Ничего не найдено'));
  await p.fill('[data-m=cq]','');await p.waitForTimeout(200);
  await p.click('[data-a=grp]');await p.waitForTimeout(300);
  await p.fill('dialog [data-m=gq]','бори');await p.waitForTimeout(200);ok('group picker search by name',(await p.$$('dialog [data-a=gsel]')).length===1);
  await p.fill('dialog [data-m=gq]','anya');await p.waitForTimeout(200);ok('group picker search by login',(await p.$$('dialog [data-a=gsel]')).length===1&&(await p.innerText('dialog')).includes('Аня'));
  await p.click('dialog [data-a=gsel]');await p.waitForTimeout(200);ok('group picker keeps search text and selection after toggle',(await p.inputValue('dialog [data-m=gq]'))==='anya'&&(await p.$('dialog .circ.on'))!==null);
  await p.click('dialog [data-a=fx]');await p.waitForTimeout(300);
  await p.click('nav [data-i=u]');await p.waitForTimeout(400);await p.click('[data-a=acs][data-i=fr]');await p.waitForTimeout(400);
  ok('friends screen: search field + list',await p.$('[data-m=fq]')!==null&&(await p.$$('#frl .card')).length===2);
  await p.fill('[data-m=fq]','Бор');await p.waitForTimeout(200);ok('friends screen: search by name',(await p.$$('#frl .card')).length===1);
  await p.fill('[data-m=fq]','anya');await p.waitForTimeout(200);ok('friends screen: search by login',(await p.innerText('#frl')).includes('Аня'));
  ok('no JS errors (search)',e.length===0,e.join(' | '));await p.close()}
 // ============ 5. swipe between tabs ============
 {const {p,e}=await mk(browser,{notes:[N(1,'x',{due:T})]});
  const swipe=async(dx)=>{await p.evaluate(dx=>{const el=document.querySelector('.pg'),mk=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});const f=(n,x,y,t)=>el.dispatchEvent(new TouchEvent(n,{bubbles:true,cancelable:true,touches:n==='touchend'?[]:[mk(x,y)],changedTouches:[mk(x,y)]}));const s=dx<0?330:60;f('touchstart',s,400);for(let i=1;i<=8;i++)f('touchmove',s+dx*i/8,402);f('touchend',s+dx,402)},dx);await p.waitForTimeout(900)};
  const act=()=>p.$eval('nav button.on',b=>b.dataset.i);
  await swipe(-200);ok('swipe left -> next tab',(await act())==='n');
  ok('swipe leaves no stuck state (no .swp, page transform cleared)',await p.evaluate(()=>!document.body.classList.contains('swp')&&(getComputedStyle(document.querySelector('.pg')).transform==='none'||getComputedStyle(document.querySelector('.pg')).transform==='matrix(1, 0, 0, 1, 0, 0)')));
  await swipe(200);ok('swipe right -> previous tab',(await act())==='m');
  await swipe(60);ok('short slow swipe snaps back (same tab)',(await act())==='m');
  // frame-time probe: animate swipe and make sure main thread is not blocked for long
  const worst=await p.evaluate(async()=>{let w=0,last=performance.now(),run=true;const tick=n=>{w=Math.max(w,n-last);last=n;if(run)requestAnimationFrame(tick)};requestAnimationFrame(tick);const el=document.querySelector('.pg'),mk=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});const f=(n,x,y)=>el.dispatchEvent(new TouchEvent(n,{bubbles:true,cancelable:true,touches:n==='touchend'?[]:[mk(x,y)],changedTouches:[mk(x,y)]}));f('touchstart',330,400);for(let i=1;i<=6;i++){f('touchmove',330-30*i,402);await new Promise(r=>setTimeout(r,16))}f('touchend',150,402);await new Promise(r=>setTimeout(r,700));run=false;return Math.round(w)});
  ok('swipe: no long frame stalls (worst frame < 120 ms in headless)',worst<120,String(worst));
  ok('no JS errors (swipe)',e.length===0,e.join(' | '));await p.close()}
 await browser.close();
 const bad=results.filter(r=>r[0]==='FAIL');console.log('TOTAL',results.length,'FAILED',bad.length);
})();
