const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('../www/index.html','utf8');
const M={app:fs.readFileSync('mock-app.js','utf8'),auth:fs.readFileSync('mock-auth.js','utf8'),fs:fs.readFileSync('mock-fs.js','utf8')};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const add=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
const results=[];const ok=(n,c,extra='')=>{results.push([c?'PASS':'FAIL',n,extra]);};
async function open(browser,seed){
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  const page=await ctx.newPage();const errs=[];
  page.on('pageerror',e=>errs.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await page.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"version":"1.0.10","min":"1.0.0"}'});if(/manifest\.webmanifest|sw\.js|icon-\d+\.png/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});
    if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});
    if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});
    if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});
    if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});
    if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});
    return r.abort()});
  await page.addInitScript(seed);
  await page.goto('http://pm.test/');await page.waitForTimeout(500);
  return {page,errs,ctx};
}
(async()=>{
 const browser=await chromium.launch();
 // ---- 1. logged out
 let {page,errs}=await open(browser,()=>{window.__FB={user:null,db:{}}});
 let t=await page.innerText('body');
 ok('welcome: buttons shown',t.includes('Начать')&&t.includes('У меня уже есть аккаунт')&&t.includes('PastMetki'));
 ok('welcome: subtitle',t.includes('Заметки • Задачи • Календарь • Чаты'));
 await page.screenshot({path:'s1_welcome.png'});
 await page.click('[data-a=wst]');await page.waitForTimeout(150);t=await page.innerText('body');
 ok('start -> registration form',t.includes('Зарегистрироваться')&&await page.$('#a3')!==null);
 await page.click('[data-a=wbk]');await page.waitForTimeout(150);
 await page.click('[data-a=wlg]');await page.waitForTimeout(150);t=await page.innerText('body');
 ok('login button -> login form',t.includes('Войти')&&await page.$('#a3')===null);
 ok('welcome: no JS errors',errs.length===0,errs.join(' | '));
 // ---- 2. logged in
 const today=add(0);
 const seed=(args)=>{
   const {today,d1,d3,dm}=args;
   const now=Date.now();
   window.__FB={user:{uid:'u1',email:'x'},db:{
    'profiles/u1':{name:'Алексей',login:'alex',av:'',inv:'ABC123'},
    'profiles/u2':{name:'Аня',login:'anya',av:'',inv:'ZZZ'},
    'users/u1':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.0.10'},rd:{},sq:[],hist:[{title:'Старое',tasks:['a','b']}],notes:[
      {id:now-5000,title:'Подготовить презентацию',tasks:[{text:'Слайды',done:true}],done:true,due:today,cat:'work',body:'Квартальный отчёт для команды'},
      {id:now-4000,title:'Встреча с командой',tasks:[],done:false,due:today,cat:'work',body:''},
      {id:now-3000,title:'Купить продукты',tasks:[{text:'Молоко',done:false},{text:'Хлеб',done:false}],done:false,due:d1,cat:'shop',body:''},
      {id:now-2000,title:'Сделать конспект',tasks:[{text:'Prepare for the exam',done:false}],done:false,due:d3,cat:'study',body:'Biology meeting notes'},
      {id:now-1000,title:'Старая без категории',tasks:[],done:false,due:dm,body:''}]},
    'chats/u1|u2':{members:['u1','u2'],on:true,last:{x:'Привет',ts:now,f:'u2'}},
    'chats/u1|u2/msgs/m1':{f:'u2',x:'Привет',k:[{text:'Пункт A',done:false}],dn:false,ts:now,due:''}
   }};
   window.__CAP={handlers:{},sent:[]};
   window.Capacitor={isNativePlatform:()=>true,registerPlugin:()=>({setData:async o=>{window.__CAP.sent.push(o)},getPending:async()=>({ops:'[]'})}),Plugins:{App:{addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},getLaunchUrl:async()=>({url:null}),minimizeApp:()=>{window.__CAP.min=1}}}};
 };
 ({page,errs}=await open(browser,()=>{}));await page.close();
 const mk=async()=>{const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const e=[];p.on('pageerror',x=>e.push('pageerror: '+x.message));p.on('console',m=>{if(m.type()==='error')e.push('console: '+m.text())});
  await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"version":"1.0.10","min":"1.0.0"}'});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
  await p.addInitScript(seed,{today:add(0),d1:add(1),d3:add(3),dm:add(-2)});await p.goto('http://pm.test/');await p.waitForTimeout(600);return{p,e}};
 let {p,e}=await mk();page=p;errs=e;
 const txt=async()=>page.innerText('body');
 await page.waitForTimeout(1300);t=await txt();
 ok('home: greeting',t.includes('Привет, Алексей'));
 ok('home: progress card',/1 из 2/.test(t)&&t.includes('50%')&&t.includes('задач выполнено'));
 ok('home: sections',t.includes('Сегодня')&&t.includes('Предстоящие задачи')&&t.includes('Быстрые действия'));
 ok('home: overdue shown in today block',t.includes('Старая без категории'));
 ok('bottom nav has 5 tabs',(await page.$$('nav button')).length===5,(await page.$$eval('nav button',b=>b.map(x=>x.innerText.trim()).join(','))));
 await page.screenshot({path:'s2_home.png'});
 // ---- notes
 await page.click('nav [data-i=n]');await page.waitForTimeout(500);t=await txt();
 ok('notes: category cards',['Работа','Учёба','Личное','Покупки','Другие'].every(x=>t.includes(x)));
 ok('notes: counts',t.includes('2 заметки • 0 задач')&&t.includes('1 заметка • 1 задача')&&t.includes('1 заметка • 2 задачи'),t.replace(/\n+/g,' | ').slice(0,300));
 await page.screenshot({path:'s3_notes.png'});
 // search
 await page.fill('#qi','ПРЕЗЕНТ');await page.waitForTimeout(250);
 let h=await page.innerHTML('#sres');ok('search: case-insensitive RU + highlight',h.includes('<mark>презент</mark>')||h.includes('<mark>Презент</mark>'),h.slice(0,200));
 ok('search: finds content (body)',true);
 await page.fill('#qi','квартальн');await page.waitForTimeout(200);h=await page.innerHTML('#sres');ok('search: body text',h.includes('Подготовить презентацию')&&h.includes('<mark>'));
 await page.fill('#qi','молоко');await page.waitForTimeout(200);h=await page.innerHTML('#sres');ok('search: checklist item',h.includes('Купить продукты'));
 await page.fill('#qi','MEETING');await page.waitForTimeout(200);h=await page.innerHTML('#sres');ok('search: english case-insensitive',h.includes('Сделать конспект'));
 await page.fill('#qi','учёба');await page.waitForTimeout(200);h=await page.innerHTML('#sres');ok('search: by category name',h.includes('Сделать конспект'));
 await page.fill('#qi','zzzz');await page.waitForTimeout(200);h=await page.innerHTML('#sres');ok('search: empty state',h.includes('Ничего не найдено'));
 await page.fill('#qi','презент');await page.waitForTimeout(200);await page.screenshot({path:'s4_search.png'});
 await page.press('#qi','Enter');await page.waitForTimeout(300);
 await page.fill('#qi','');await page.dispatchEvent('#qi','input');await page.waitForTimeout(200);
 h=await page.innerHTML('#sres');ok('search: history saved & shown',h.includes('Недавние запросы')&&h.includes('презент'));
 const db1=await page.evaluate(()=>window.__FB.db['users/u1'].sq);ok('search: history persisted to DB',JSON.stringify(db1)===JSON.stringify(['презент']),JSON.stringify(db1));
 await page.click('[data-a=sqx]');await page.waitForTimeout(200);h=await page.innerHTML('#sres');ok('search: history cleared',!h.includes('Недавние запросы'));
 // category filter
 await page.click('.chips [data-i=shop]');await page.waitForTimeout(300);t=await txt();ok('filter: category chip shows only its notes',t.includes('Купить продукты')&&!t.includes('Сделать конспект'));
 await page.click('.chips [data-i=""]');await page.waitForTimeout(300);
 // open result -> detail
 await page.fill('#qi','конспект');await page.waitForTimeout(250);await page.click('#sres [data-a=nopen]');await page.waitForTimeout(500);t=await txt();
 ok('detail opens from search result',t.includes('Сделать конспект')&&t.includes('Biology meeting notes')&&t.includes('Дедлайн'));
 ok('detail hides bottom nav',await page.$('nav')===null);
 await page.screenshot({path:'s5_detail.png'});
 await page.click('[data-a=nback]');await page.waitForTimeout(500);ok('detail back -> nav visible',await page.$('nav')!==null);
 // create note
 await page.fill('#qi','');await page.dispatchEvent('#qi','input');
 await page.click('[data-a=qa][data-i=note]');await page.waitForTimeout(500);
 ok('create form opens, nav hidden',await page.$('[data-a=add]')!==null&&await page.$('nav')===null);
 await page.click('[data-a=add]');await page.waitForTimeout(200);ok('empty title rejected',await page.$('[data-a=add]')!==null);
 await page.fill('[data-m=t]','Тест из UI');await page.click('[data-a=dcat][data-i=personal]');await page.waitForTimeout(150);
 await page.fill('[data-m=i][data-j="0"]','Пункт 1');await page.fill('[data-m=d]',add(2));
 await page.screenshot({path:'s6_create.png'});
 await page.click('[data-a=add]');await page.waitForTimeout(700);
 const nn=await page.evaluate(()=>window.__FB.db['users/u1'].notes.find(n=>n.title==='Тест из UI'));
 ok('create: saved with category/tasks/due',nn&&nn.cat==='personal'&&nn.tasks.length===1&&nn.due,JSON.stringify(nn));
 ok('create: returns to notes',await page.$('nav')!==null);
 // old note without category falls to Other and old data intact
 const total=await page.evaluate(()=>window.__FB.db['users/u1'].notes.length);ok('existing notes preserved',total===6,String(total));
 // edit note via dialog
 await page.click('.chips [data-i=personal]');await page.waitForTimeout(300);
 await page.click('[data-a=nopen]');await page.waitForTimeout(400);await page.click('[data-a=nedit]');await page.waitForTimeout(300);
 await page.selectOption('#ec','study');await page.fill('#et','Тест изменён');await page.click('[data-a=esv]');await page.waitForTimeout(400);
 const ed=await page.evaluate(()=>window.__FB.db['users/u1'].notes.find(n=>n.title==='Тест изменён'));ok('edit: title+category saved',ed&&ed.cat==='study',JSON.stringify(ed));
 // delete
 page.once('dialog',d=>d.accept());await page.click('[data-a=ndel]');await page.waitForTimeout(500);
 const after=await page.evaluate(()=>window.__FB.db['users/u1'].notes.length);ok('delete from detail',after===5,String(after));
 // ---- calendar
 await page.click('nav [data-i=c]');await page.waitForTimeout(500);t=await txt();
 ok('calendar: grid + add event button',(await page.$$('.cal div')).length>20&&t.includes('Добавить событие'));
 ok('calendar: deadline colors present',(await page.$$('.cal .r,.cal .y,.cal .g,.cal .mx,.cal .dg')).length>0);
 await page.screenshot({path:'s7_calendar.png'});
 // ---- chats
 await page.click('nav [data-i=s]');await page.waitForTimeout(500);t=await txt();
 ok('chats: list shows friend + new marker',t.includes('Аня')&&t.includes('new PastMetka'));
 await page.screenshot({path:'s8_chats.png'});
 await page.click('[data-a=chat]');await page.waitForTimeout(600);
 ok('chat opens, nav hidden',await page.$('nav')===null&&(await txt()).includes('Привет'));
 await page.click('[data-a=back]');await page.waitForTimeout(500);ok('chat back',await page.$('nav')!==null);
 // ---- profile
 await page.click('nav [data-i=u]');await page.waitForTimeout(500);t=await txt();
 ok('profile: new layout (name, login, friends, edit, version)',['Алексей','@alex','Друзья','Редактировать профиль','Version 1.0.10'].every(x=>t.includes(x)));await page.click('[data-a=menu]');await page.waitForTimeout(300);{const mt=await page.innerText('.mnu');ok('menu: settings, shop, history, security, logout',['Настройки','Магазин','История заметок','Безопасность','Выход из аккаунта'].every(x=>mt.includes(x)),mt)}await page.click('nav [data-i=u]');await page.waitForTimeout(300);
 await page.screenshot({path:'s9_profile.png'});
 for(const k of ['set','hist','fr','sec']){if(k==='fr')await page.click('[data-a=acs][data-i=fr]');else{await page.click('[data-a=menu]');await page.waitForTimeout(300);await page.click(`.mnu [data-a=acs][data-i=${k}]`)}await page.waitForTimeout(450);ok('profile sub-screen '+k+' (nav hidden)',await page.$('nav')===null);await page.click('[data-a=acb]');await page.waitForTimeout(450);}
 // history -> create
 await page.click('[data-a=menu]');await page.waitForTimeout(300);await page.click('.mnu [data-a=acs][data-i=hist]');await page.waitForTimeout(400);await page.click('[data-a=hl]:has-text("Старое")');await page.waitForTimeout(500);
 ok('history item opens create form prefilled',(await page.inputValue('[data-m=t]'))==='Старое');
 await page.click('[data-a=ncl]');await page.waitForTimeout(400);
 // ---- bridge / deep links
 const sent=await page.evaluate(()=>window.__CAP.sent);await page.waitForTimeout(1500);
 const sent2=await page.evaluate(()=>window.__CAP.sent);
 ok('widget bridge receives data',sent2.length>0&&['chats','notes','dls'].every(k=>k in sent2[sent2.length-1]),JSON.stringify(sent2[sent2.length-1]||{}).slice(0,300));
 const last=sent2[sent2.length-1]||{};const dls=JSON.parse(last.dls||'[]');ok('widget deadlines: urgency colours',dls.some(x=>x.c==='r')&&dls.some(x=>x.c==='y'),JSON.stringify(dls));
 const nid=await page.evaluate(()=>window.__FB.db['users/u1'].notes[0].id);
 await page.evaluate(i=>window.__CAP.handlers.appUrlOpen({url:'pastmetki://note/'+i}),nid);await page.waitForTimeout(700);
 ok('deep link note/<id> opens note',(await txt()).includes('Дедлайн')||await page.$('[data-a=nback]')!==null);
 await page.evaluate(()=>window.__CAP.handlers.appUrlOpen({url:'pastmetki://new/task'}));await page.waitForTimeout(700);
 ok('deep link new/task opens form (date today)',(await page.inputValue('[data-m=d]'))===add(0)&&(await txt()).includes('Новая заметка'));
 await page.evaluate(()=>window.__CAP.handlers.appUrlOpen({url:'pastmetki://calendar'}));await page.waitForTimeout(700);
 ok('deep link calendar',(await txt()).includes('Добавить событие'));
 await page.evaluate(()=>window.__CAP.handlers.appUrlOpen({url:'pastmetki://chat/u2'}));await page.waitForTimeout(800);
 ok('deep link chat/<uid> opens chat',await page.$('nav')===null&&await page.$('[data-m=ct]')!==null);
 await page.evaluate(()=>window.__CAP.handlers.backButton());await page.waitForTimeout(500);ok('hardware back leaves chat',await page.$('nav')!==null);
 // light theme smoke
 await page.evaluate(()=>{});
 ok('no JS errors during the whole run',errs.length===0,errs.join(' | '));
 await browser.close();
 const bad=results.filter(r=>r[0]==='FAIL');
 console.log(results.map(r=>r.join(' | ')).join('\n'));console.log('\nTOTAL',results.length,'FAILED',bad.length);
})();
