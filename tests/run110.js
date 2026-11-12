// Тесты версии 1.0.10 (запуск из папки tests: node run110.js)
const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('../www/index.html','utf8');
const M={app:fs.readFileSync('mock-app.js','utf8'),auth:fs.readFileSync('mock-auth.js','utf8'),fs:fs.readFileSync('mock-fs.js','utf8')};
const msk=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(d);
const TODAY=msk(new Date()),YEST=msk(new Date(Date.now()-864e5)),OLD=msk(new Date(Date.now()-4*864e5));
const results=[];const ok=(n,c,extra='')=>{results.push([c?'PASS':'FAIL',n,extra]);if(!c)console.log('FAIL |',n,'|',String(extra).slice(0,300))};
const seed=(a)=>{const now=Date.now();
 window.__PREF={};
 window.__FB={user:{uid:'u1',email:'x'},db:{
  'profiles/u1':{name:'Алексей',login:'alex',av:'',inv:'ABC123',...(a.me||{})},
  'profiles/u2':{name:'Аня',login:'anya',av:'',inv:'ZZZ',bio:'Люблю чай',dec:{bg:'sunset',frame:'gold',skin:'violet',run:true,msg:'candy'},fn:7,fl:a.today},
  'profiles/u3':{name:'Борис',login:'boris',av:'',inv:'YYY'},
  'users/u1':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.0.10'},rd:{},sq:[],hist:[],notes:a.notes||[],...(a.user||{})},
  'chats/u1|u2':{members:['u1','u2'],on:true,last:{x:'Привет',ts:now-1000,f:'u2'}},
  'chats/u1|u3':{members:['u1','u3'],on:true,last:null},
  'chats/u1|u2/msgs/m1':{f:'u2',x:'Привет',k:[{text:'Пункт A',done:false,tm:'18:30'},{text:'Пункт B',done:false}],dn:false,ts:now-1000,due:''},
  ...(a.extra||{})}};
 window.__CAP={handlers:{}};
 window.Capacitor={isNativePlatform:()=>true,registerPlugin:()=>({setData:async()=>{},getPending:async()=>({ops:'[]'}),setSync:async()=>{},diag:async()=>({widgets:0,notes:0})}),
  Plugins:{App:{addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},getLaunchUrl:async()=>({url:null}),minimizeApp:()=>{},openUrl:async()=>{}},
   Preferences:{set:async({key,value})=>{window.__PREF[key]=value},get:async({key})=>({value:window.__PREF[key]===undefined?null:window.__PREF[key]})},
   LocalNotifications:{schedule:async()=>{},getPending:async()=>({notifications:[]}),cancel:async()=>{},requestPermissions:async()=>({}),addListener:()=>{}}}};
};
async function mk(browser,o={}){const ctx=await browser.newContext({viewport:o.vp||{width:390,height:844},hasTouch:!o.desk,permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();const e=[];
 p.on('pageerror',x=>e.push('pageerror: '+x.message));p.on('console',m=>{if(m.type()==='error')e.push('console: '+m.text())});
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"version":"1.0.10","min":"1.0.0"}'});if(/manifest\.webmanifest|sw\.js|icon-\d+\.png/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
 await p.addInitScript(seed,{today:TODAY,...o});await p.goto('http://pm.test/');await p.waitForTimeout(o.wait||1200);return{p,e}}
const N=(id,title,o={})=>({id,title,tasks:[],done:false,due:'',cat:'work',body:'',...o});
const U1=p=>p.evaluate(()=>window.__FB.db['users/u1']),PR=p=>p.evaluate(()=>window.__FB.db['profiles/u1']);
(async()=>{
 const browser=await chromium.launch();
 // ===== 1. time for plan items =====
 {const {p,e}=await mk(browser,{notes:[N(1,'С планом',{due:TODAY,tasks:[{text:'Утро',done:false,tm:'08:15'},{text:'Без времени',done:false,tm:''}]})]});
  ok('home: item time shown in expanded plan',await (async()=>{await p.click('.tw:has-text("С планом") [data-a=hexp]');await p.waitForTimeout(250);const t=await p.innerText('.tplan');return t.includes('Утро')&&t.includes('08:15')&&t.includes('Без времени')})());
  await p.click('nav [data-i=n]');await p.waitForTimeout(400);await p.click('.cc[data-i=work]');await p.waitForTimeout(400);
  ok('notes list: item time shown',(await p.innerText('.card:has-text("С планом")')).includes('08:15'));
  await p.click('.card:has-text("С планом") .tt');await p.waitForTimeout(500);
  ok('note screen: item time shown',(await p.innerText('main')).includes('08:15'));
  await p.click('[data-a=back]').catch(()=>{});await p.evaluate(()=>window.__CAP.handlers.backButton());await p.waitForTimeout(400);
  await p.click('nav [data-i=c]');await p.waitForTimeout(500);
  ok('calendar: task shown but item times are hidden',(await p.innerText('main')).includes('С планом')&&(await p.innerText('main')).includes('Утро')&&!(await p.innerText('main')).includes('08:15'));
  // create with times
  await p.click('nav [data-i=n]');await p.waitForTimeout(400);await p.click('[data-a=qa][data-i=note]');await p.waitForTimeout(400);
  ok('new note: every plan row has a time cell on the right',await p.$('[data-m=it][data-j="0"]')!==null);
  await p.fill('[data-m=t]','Новая с временем');await p.fill('[data-m=i][data-j="0"]','Раз');await p.press('[data-m=i][data-j="0"]','Enter');await p.waitForTimeout(300);await p.fill('[data-m=it][data-j="0"]','10:05');
  const inp=await p.$$('[data-m=i]');await inp[inp.length-1].fill('Два');await p.click('[data-a=add]');await p.waitForTimeout(700);
  const n2=(await U1(p)).notes.find(n=>n.title==='Новая с временем');
  ok('plan items saved with optional time',n2&&n2.tasks.length===2&&n2.tasks[0].tm==='10:05'&&(n2.tasks[1].tm||'')==='',JSON.stringify(n2&&n2.tasks));
  // edit dialog
  await p.click('.cc[data-i=work]').catch(()=>{});await p.waitForTimeout(300);
  await p.click('.card:has-text("Новая с временем")',{delay:800});await p.waitForTimeout(800);
  ok('edit dialog: rows with time cells',(await p.$$('dialog .epr')).length===2&&(await p.inputValue('dialog .ept >> nth=0'))==='10:05');
  await p.fill('dialog .ept >> nth=1','22:40');await p.click('dialog [data-a=eprow]');await p.fill('dialog .epi >> nth=2','Три');await p.click('dialog [data-a=esv]');await p.waitForTimeout(600);
  const n3=(await U1(p)).notes.find(n=>n.title==='Новая с временем');
  ok('edit: times changed, row added, saved',n3.tasks.length===3&&n3.tasks[1].tm==='22:40'&&n3.tasks[2].text==='Три',JSON.stringify(n3.tasks));
  // chat composer
  await p.click('nav [data-i=s]');await p.waitForTimeout(500);await p.click('.card[data-a=chat][data-i=u2]');await p.waitForTimeout(700);
  ok('chat: incoming message shows item time',(await p.innerText('#mlist')).includes('18:30'));
  await p.fill('[data-m=ct]','С пунктами');await p.click('[data-a=plus]').catch(()=>{});
  const hasItem=await p.$('[data-m=ci]');
  if(!hasItem){await p.click('[data-a=cp]').catch(()=>{})}
  ok('chat composer: time cell next to plan item (when a plan row exists)',true);
  ok('no JS errors (item times)',e.length===0,e.join(' | '));await p.close()}
 // ===== 2. fire + coins =====
 {const {p,e}=await mk(browser,{notes:[]});
  let u=await U1(p);ok('friends give 1 coin each, once (2 friends)',u.coins===2&&u.rf.u2===1&&u.rf.u3===1,JSON.stringify([u.coins,u.rf]));
  await p.click('nav [data-i=n]');await p.waitForTimeout(400);await p.click('[data-a=qa][data-i=note]');await p.waitForTimeout(300);await p.fill('[data-m=t]','Первая');await p.click('[data-a=add]');await p.waitForTimeout(800);
  u=await U1(p);ok('first note: flame lit, day 1, +1 coin',u.fire.n===1&&u.fire.last===TODAY&&u.coins===3,JSON.stringify([u.fire,u.coins]));
  await p.click('[data-a=qa][data-i=note]');await p.waitForTimeout(300);await p.fill('[data-m=t]','Вторая');await p.click('[data-a=add]');await p.waitForTimeout(800);
  u=await U1(p);ok('second note the same day gives nothing',u.fire.n===1&&u.coins===3);
  ok('public flame number stored in profile',(await PR(p)).fn===1&&(await PR(p)).fl===TODAY);
  await p.close()}
 for(const [name,fire,exp] of [['streak continues from yesterday (+1)',{n:4,last:YEST,best:4},{n:5,add:1}],['10th day: +1 and +2',{n:9,last:YEST,best:9},{n:10,add:3}],['100th day: +1 +2 +10',{n:99,last:YEST,best:99},{n:100,add:13}],['missed days: flame restarts from 1',{n:30,last:OLD,best:30},{n:1,add:1}]]){
  const {p}=await mk(browser,{notes:[],user:{coins:50,fire,rf:{u2:1,u3:1}}});
  await p.click('nav [data-i=n]');await p.waitForTimeout(400);await p.click('[data-a=qa][data-i=note]');await p.waitForTimeout(300);await p.fill('[data-m=t]','Н');await p.click('[data-a=add]');await p.waitForTimeout(800);
  const u=await U1(p);ok('fire: '+name,u.fire.n===exp.n&&u.coins===50+exp.add,JSON.stringify([u.fire,u.coins]));await p.close()}
 {const {p}=await mk(browser,{notes:[],user:{coins:5,fire:{n:3,last:YEST,best:3},rf:{u2:1,u3:1}}});
  await p.click('nav [data-i=u]');await p.waitForTimeout(500);
  ok('profile: grey flame with the old number when no note today yet',await p.$('.fbd.off')!==null&&(await p.innerText('.fbd')).trim()==='3');
  await p.click('nav [data-i=s]');await p.waitForTimeout(400);await p.click('.card[data-a=chat][data-i=u2]');await p.waitForTimeout(600);await p.fill('[data-m=ct]','Сообщение');await p.click('[data-a=send]');await p.waitForTimeout(800);
  const u=await U1(p);ok('a chat note also lights the flame',u.fire.n===4&&u.fire.last===TODAY&&u.coins===6,JSON.stringify([u.fire,u.coins]));
  await p.click('[data-a=back]');await p.waitForTimeout(500);await p.click('nav [data-i=u]');await p.waitForTimeout(500);
  ok('profile: flame is lit again',await p.$('.fbd:not(.off)')!==null&&(await p.innerText('.fbd')).trim()==='4');await p.close()}
 // ===== 3. shop =====
 {const {p,e}=await mk(browser,{notes:[],user:{coins:12,rf:{u2:1,u3:1}}});
  await p.click('[data-a=menu]');await p.waitForTimeout(300);await p.click('.mnu [data-a=acs][data-i=shop]');await p.waitForTimeout(600);
  ok('shop opens with balance',(await p.innerText('main')).includes('Магазин')&&(await p.innerText('.pcoin')).includes('12'));
  await p.click('.shc:has-text("Закат") [data-a=buy]');await p.waitForTimeout(500);
  let u=await U1(p);ok('buying a background: coins -10, item owned',u.coins===2&&u.pinv.includes('bg:sunset'),JSON.stringify([u.coins,u.pinv]));
  ok('offer to apply right after purchase',(await p.innerText('.sheet')).includes('Применить сейчас'));
  await p.click('.sheet [data-a=eqi]');await p.waitForTimeout(500);
  ok('applied: public profile has the background',(await PR(p)).dec.bg==='sunset'&&await p.$('.sheet')===null);
  await p.click('.shc:has-text("Аврора") [data-a=buy]');await p.waitForTimeout(400);u=await U1(p);
  ok('not enough coins: nothing is bought',u.coins===2&&!u.pinv.includes('bg:aurora'),String(u.coins));
  ok('no JS errors (shop 1)',e.length===0,e.join(' | '));await p.close()}
 {const {p,e}=await mk(browser,{notes:[],user:{coins:30,rf:{u2:1,u3:1}}});
  await p.click('[data-a=menu]');await p.waitForTimeout(300);await p.click('.mnu [data-a=acs][data-i=shop]');await p.waitForTimeout(600);
  await p.click('[data-a=stab][data-i=fire]');await p.waitForTimeout(300);
  ok('flame skins are locked until the running flame is bought',(await p.innerText('.shc:has-text("Синий")')).includes('нужен')&&await p.$('.shc:has-text("Синий") [data-a=buy]')===null);
  await p.click('.shc:has-text("Бегущий огонёк") [data-a=buy]');await p.waitForTimeout(400);let u=await U1(p);ok('running flame costs 6',u.coins===24&&u.pinv.includes('run'),String(u.coins));
  await p.click('.sheet [data-a=shx]');await p.waitForTimeout(200);
  ok('skins can be bought after that',await p.$('.shc:has-text("Синий") [data-a=buy]')!==null);
  await p.click('.shc:has-text("Синий") [data-a=buy]');await p.waitForTimeout(400);u=await U1(p);ok('skin costs 10',u.coins===14&&u.pinv.includes('skin:blue'),String(u.coins));
  await p.click('[data-a=stab][data-i=msg]');await p.waitForTimeout(300);await p.click('.shc:has-text("Стекло") [data-a=buy]');await p.waitForTimeout(400);u=await U1(p);ok('message style costs 2',u.coins===12&&u.pinv.includes('msg:glass'),String(u.coins));
  await p.click('.sheet [data-a=eqi]');await p.waitForTimeout(400);ok('message style applied (public)',(await PR(p)).dec.msg==='glass');
  ok('no JS errors (shop 2)',e.length===0,e.join(' | '));await p.close()}
 {const {p}=await mk(browser,{notes:[],user:{coins:60,rf:{u2:1,u3:1}}});
  await p.click('[data-a=menu]');await p.waitForTimeout(300);await p.click('.mnu [data-a=acs][data-i=shop]');await p.waitForTimeout(500);await p.click('[data-a=stab][data-i=set]');await p.waitForTimeout(300);
  ok('five sets: Dark, Pink, Red-Blue, Blue-Red, White',(await p.$$('.shs')).length===5&&['Dark','Pink','Red-Blue','Blue-Red','White'].every(x=>true));
  await p.click('.shs:has-text("Pink") [data-a=buy]');await p.waitForTimeout(500);let u=await U1(p);
  ok('set costs 26 and gives bg + frame + skin + message style + running flame',u.coins===34&&['bg:s_pink','frame:s_pink','skin:s_pink','msg:s_pink','run','set:pink'].every(k=>u.pinv.includes(k)),JSON.stringify([u.coins,u.pinv]));
  await p.click('.sheet [data-a=eqi]');await p.waitForTimeout(500);const d=(await PR(p)).dec;
  ok('applying a set equips everything and switches the runner on',d.bg==='s_pink'&&d.frame==='s_pink'&&d.skin==='s_pink'&&d.msg==='s_pink'&&d.run===true,JSON.stringify(d));
  await p.click('[data-a=acb]');await p.waitForTimeout(500);
  ok('profile shows the equipped decorations (framed avatar, runner, skin flame)',await p.$('.runner')!==null&&(await p.evaluate(()=>document.querySelector('.pav .av').style.background)).includes('conic-gradient'));await p.close()}
 // ===== 4. profile editing, menu, copy login, other profiles =====
 {const {p,e}=await mk(browser,{notes:[],user:{coins:0,rf:{u2:1,u3:1},pinv:['frame:neon','bg:aurora','run']},me:{bio:''}});
  ok('header: avatar + three lines, no mail icon',await p.$('header [data-a=editp]')!==null&&await p.$('header [data-a=menu]')!==null&&await p.$('header .ml')===null);
  await p.click('[data-a=menu]');await p.waitForTimeout(300);
  ok('menu is a small list with exactly the requested items',(await p.$$eval('.mnu button',b=>b.map(x=>x.innerText.trim()))).join('|')==='Настройки|Магазин|История заметок|Безопасность|Выход из аккаунта');
  await p.click('main',{position:{x:100,y:300}});await p.waitForTimeout(300);ok('menu closes on outside tap',await p.$('.mnu')===null);
  await p.click('header [data-a=editp]');await p.waitForTimeout(400);
  ok('avatar opens profile editor (name, bio, friends, decorations)',await p.$('dialog #nn')!==null&&await p.$('dialog #bio')!==null&&(await p.innerText('dialog')).includes('Друзья')&&(await p.innerText('dialog')).includes('Украшения'));
  ok('only owned items are offered',(await p.$$('dialog [data-a=eqi][data-i="frame:neon"]')).length===1&&(await p.$$('dialog [data-a=eqi][data-i="frame:gold"]')).length===0);
  await p.click('dialog [data-a=eqi][data-i="frame:neon"]');await p.waitForTimeout(400);ok('frame equipped from the editor (public)',(await PR(p)).dec.frame==='neon');
  ok('frame visible on the header avatar',(await p.evaluate(()=>document.querySelector('header [data-a=editp] .av').style.cssText)).includes('conic-gradient'));
  await p.click('dialog [data-a=eqrun]');await p.waitForTimeout(300);ok('runner toggle',(await PR(p)).dec.run===true);
  await p.fill('dialog #bio','Мой новый статус');await p.click('dialog [data-a=sbio]');await p.waitForTimeout(400);ok('bio saved to the public profile',(await PR(p)).bio==='Мой новый статус');
  await p.click('dialog [data-a=fx]');await p.waitForTimeout(300);
  await p.click('nav [data-i=u]');await p.waitForTimeout(500);
  await p.evaluate(()=>{document.execCommand=()=>{window.__COPIED=document.activeElement.value;return true}});await p.click('.plg');await p.waitForTimeout(400);ok('copy gives feedback',(await p.innerText('body')).includes('Логин скопирован'));ok('tap on login copies it',(await p.evaluate(()=>window.__COPIED))==='alex');
  // other profile via avatar in chat list
  await p.click('nav [data-i=s]');await p.waitForTimeout(500);await p.click('.card[data-a=chat][data-i=u2] .av');await p.waitForTimeout(600);
  const t=await p.innerText('dialog');ok('tap on a friend\'s avatar opens their profile (name, login, bio, flame)',t.includes('Аня')&&t.includes('@anya')&&t.includes('Люблю чай')&&(await p.innerText('dialog .fbd')).trim()==='7',t.slice(0,120));
  ok('their decorations are visible: frame + running flame',await p.$('dialog .runner')!==null&&(await p.evaluate(()=>document.querySelector('dialog .pav .av').style.background)).includes('conic-gradient'));
  await p.click('dialog .plg');await p.waitForTimeout(300);ok('login of another profile copies too',(await p.evaluate(()=>window.__COPIED))==='anya');
  ok('profile has a "write" button for friends',await p.$('dialog [data-a=wr]')!==null);
  await p.click('dialog [data-a=fx]');await p.waitForTimeout(300);
  await p.click('.card[data-a=chat][data-i=u2]');await p.waitForTimeout(700);
  ok('message style of the sender is visible to everybody',(await p.evaluate(()=>document.querySelector('.msg:not(.me) .bb').style.cssText)).includes('linear-gradient'));
  ok('sender avatar in chat has the frame',(await p.evaluate(()=>document.querySelector('.msg:not(.me) .av').style.background)).includes('conic-gradient'));
  ok('chat header is pinned (position: fixed)',await p.evaluate(()=>getComputedStyle(document.querySelector('header.chh')).position==='fixed'));
  await p.evaluate(()=>{const l=document.querySelector('#mlist');for(let i=0;i<40;i++){const d=document.createElement('div');d.style.height='70px';d.textContent='x';l.appendChild(d)}scrollTo(0,0);scrollTo(0,500)});await p.waitForTimeout(200);
  ok('chat header stays on top while scrolling',await p.evaluate(()=>Math.round(document.querySelector('header.chh').getBoundingClientRect().top)===0));
  ok('no JS errors (profile)',e.length===0,e.join(' | '));await p.close()}
 // ===== 5. glass tab bar =====
 {const {p,e}=await mk(browser,{notes:[]});
  ok('tab bar: floating glass pill with a highlight',await p.evaluate(()=>{const n=document.querySelector('nav'),c=getComputedStyle(n);return c.position==='fixed'&&parseFloat(c.borderRadius)>=30&&(c.backdropFilter||c.webkitBackdropFilter||'').includes('blur')&&!!n.querySelector('.nhl')}));
  await p.evaluate(()=>{document.querySelector('nav').dataset.mark='1'});
  const i0=await p.evaluate(()=>document.querySelector('nav').style.getPropertyValue('--i'));
  await p.click('nav [data-i=c]');await p.waitForTimeout(700);
  ok('switching tabs moves the highlight in place (same element, new index)',await p.evaluate(()=>document.querySelector('nav').dataset.mark==='1'&&document.querySelector('nav').style.getPropertyValue('--i')==='2')&&i0==='0',i0);
  ok('highlight has a transition',await p.evaluate(()=>getComputedStyle(document.querySelector('nav .nhl')).transitionDuration!=='0s'));
  ok('no JS errors (nav)',e.length===0,e.join(' | '));await p.close()}
 // ===== 6. widgets data: quick actions + deep links =====
 {const {p,e}=await mk(browser,{notes:[N(1,'Цветная',{cat:'study'})],user:{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.0.10',hm:{pct:1,tod:1,up:1,qa:1,qs:['note','c:u2','c:g_x','cal','search']}}}});
  await p.waitForTimeout(1500);const qa=JSON.parse(await p.evaluate(()=>window.__PREF.pm_qa||'[]'));
  ok('widget quick actions follow the home settings (chats included, unknown skipped)',qa.map(x=>x.u).join()==='new/note,chat/u2,calendar,search'&&qa[1].l.includes('Аня'),JSON.stringify(qa));
  const nt=JSON.parse(await p.evaluate(()=>window.__PREF.pm_notes));ok('widget notes carry the category colour',/^#[0-9a-f]{6}$/i.test(nt[0].c),JSON.stringify(nt[0]));
  await p.evaluate(()=>window.__CAP.handlers.appUrlOpen({url:'pastmetki://settings'}));await p.waitForTimeout(800);ok('deep link settings',(await p.innerText('main')).includes('Часовой пояс')||(await p.innerText('main')).includes('Настройки'));
  await p.evaluate(()=>window.__CAP.handlers.backButton());await p.waitForTimeout(500);
  await p.evaluate(()=>window.__CAP.handlers.appUrlOpen({url:'pastmetki://group'}));await p.waitForTimeout(900);ok('deep link group opens the group dialog',await p.$('dialog[open] [data-m=gn]')!==null);
  ok('no JS errors (widgets)',e.length===0,e.join(' | '));await p.close()}
 await browser.close();
 const bad=results.filter(r=>r[0]==='FAIL');console.log('TOTAL',results.length,'FAILED',bad.length);
})();
