// Тесты версии 1.0.7 (запуск из папки tests: node run107.js)
const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('../www/index.html','utf8');
const M={app:fs.readFileSync('mock-app.js','utf8'),auth:fs.readFileSync('mock-auth.js','utf8'),fs:fs.readFileSync('mock-fs.js','utf8')};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const add=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
const results=[];const ok=(n,c,extra='')=>{results.push([c?'PASS':'FAIL',n,extra]);if(!c)console.log('FAIL |',n,'|',String(extra).slice(0,300))};
const seed=(a)=>{const now=Date.now(),D=864e5;
 window.__FB={user:{uid:a.uid,email:'x'},db:{
  'profiles/u1':{name:'Алексей',login:'alex',av:'',inv:'ABC123'},'profiles/u2':{name:'Аня',login:'anya',av:'',inv:'ZZZ'},'profiles/u3':{name:'Борис',login:'boris',av:'',inv:'YYY'},
  'users/u1':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.0.10'},rd:{},sq:[],hist:[],notes:[
    {id:now-5000,title:'План с пунктами',tasks:[{text:'Первый',done:true},{text:'Второй',done:false}],done:false,due:a.today,dtm:'',cat:'work',body:''},
    {id:now-4000,title:'Будущая',tasks:[],done:false,due:a.d3,cat:'work',body:''}]},
  'users/u2':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.0.10'},rd:{},sq:[],hist:[],notes:[]},
  'chats/u1|u2':{members:['u1','u2'],on:true,last:{x:'Привет',ts:now,f:'u2'}},
  'chats/u1|u3':{members:['u1','u3'],on:true,last:null},
  'chats/u1|u2/msgs/m0':{f:'u2',x:'Давно',k:[],dn:false,ts:now-3*D,due:''},
  'chats/u1|u2/msgs/m1':{f:'u2',x:'Привет',k:[],dn:false,ts:now,due:''},
  ...(a.groups||{})
 }};
 window.__CAP={handlers:{},sent:[]};
 window.Capacitor={isNativePlatform:()=>true,registerPlugin:()=>({setData:async o=>{window.__CAP.sent.push(o)},getPending:async()=>({ops:'[]'})}),Plugins:{App:{addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},getLaunchUrl:async()=>({url:null}),minimizeApp:()=>{}}}};
};
async function mk(browser,o={}){const ctx=await browser.newContext({viewport:o.vp||{width:390,height:844},hasTouch:!o.desk});const p=await ctx.newPage();const e=[];
 p.on('pageerror',x=>e.push('pageerror: '+x.message));p.on('console',m=>{if(m.type()==='error')e.push('console: '+m.text())});
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"version":"1.0.10","min":"1.0.0"}'});if(/manifest\.webmanifest|sw\.js|icon-\d+\.png/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
 await p.addInitScript(seed,{uid:o.uid||'u1',today:add(0),d3:add(3),groups:o.groups||{}});await p.goto('http://pm.test/');await p.waitForTimeout(700);return{p,e}}
const G={ // группа u2 (создатель), u1 приглашён
 'groups/g1':{name:'Клуб',av:'',owner:'u2',members:['u2'],muted:[],ts:1,last:null},
 'ginv/g1_u1':{gid:'g1',gn:'Клуб',ga:'',from:'u2',to:'u1',ts:2}};
(async()=>{
 const browser=await chromium.launch();
 // ================= MOBILE =================
 {const {p:page,e:errs}=await mk(browser,{groups:G});
 const txt=()=>page.innerText('body'),db=k=>page.evaluate(k=>window.__FB.db[k],k);
 ok('mobile: sidebar hidden',await page.evaluate(()=>getComputedStyle(document.querySelector('.side')).display)==='none');
 ok('mobile: invite badge counts group invites',(await page.innerText('header .hb s').catch(()=>'x'))===''&&await page.$('header .hb s')!==null);
 // home: no "Задача" quick action; order; expand plan; tap to calendar
 ok('home: no "Задача" quick action',await page.$('.qa [data-i=task]')===null&&!(await page.innerText('.qa')).includes('Задача'));
 await page.click('.tw:has-text("План с пунктами") [data-a=hexp]');await page.waitForTimeout(300);
 ok('home: plan expands with arrow',(await page.innerText('.tplan')).includes('Второй'));
 await page.click('.tplan .tk >> nth=1');await page.waitForTimeout(300);
 ok('home: plan item toggles (still on home)',(await db('users/u1')).notes[0].tasks[1].done===true&&await page.$('.hcols')!==null);
 await page.click('.tw:has-text("План с пунктами") [data-a=hexp]');await page.waitForTimeout(250);
 ok('home: plan collapses',await page.$('.tplan')===null);
 await page.click('.tw:has-text("Будущая") .tt');await page.waitForTimeout(500);
 ok('home: tap on task opens calendar on its date',(await txt()).includes('Дедлайны на '+add(3).split('-').reverse().join('.')),(await txt()).slice(0,200));
 await page.click('nav [data-i=m]');await page.waitForTimeout(400);
 // drag reorder of quick actions (mouse emulation)
 let order=await page.$$eval('.qa .qb',e=>e.map(x=>x.dataset.q));
 const a=await page.locator('.qa .qb >> nth=0').boundingBox(),b=await page.locator('.qa .qb >> nth=2').boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.waitForTimeout(700);
 ok('drag: button lifts after long press',await page.$('.qb.drag')!==null);
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();await page.waitForTimeout(950);
 const o2=await page.$$eval('.qa .qb',e=>e.map(x=>x.dataset.q));
 ok('drag: order changed',o2.join()!==order.join()&&o2[o2.length-1]===order[0],order+' -> '+o2);
 ok('drag: order saved',((await db('users/u1')).s.hm.qs||[]).join()===o2.join());
 ok('drag: no accidental action fired (still home)',await page.$('.hcols')!==null&&await page.$('dialog[open]')===null);
 // invitations: inbox shows group invite, info, accept
 await page.click('[data-a=menu]');await page.waitForTimeout(300);await page.click('.mnu [data-a=mi][data-i=inv]');await page.waitForTimeout(300);
 ok('inbox lists group invitation with creator',(await page.innerText('dialog')).includes('Клуб')&&(await page.innerText('dialog')).includes('Аня'));
 await page.click('dialog [data-lt=gi]',{delay:700});await page.waitForTimeout(900);
 ok('long-press on invitation shows name, creator',(await page.innerText('dialog')).includes('Создатель: Аня')&&(await page.innerText('dialog')).includes('Клуб'));
 await page.click('dialog [data-a=mail]');await page.waitForTimeout(300);
 await page.click('dialog [data-a=gacc]');await page.waitForTimeout(700);
 const g1=await db('groups/g1');ok('accept: user added to group members',g1&&g1.members.includes('u1')&&g1.members.includes('u2'),JSON.stringify(g1));
 ok('accept: invitation deleted',!(await db('ginv/g1_u1')));
 await page.evaluate(()=>{const d=document.querySelector('dialog');if(d.open)d.close()});
 await page.click('nav [data-i=s]');await page.waitForTimeout(400);
 ok('accepted group appears in chats',(await txt()).includes('Клуб')&&(await txt()).includes('2 участника'));
 ok('no JS errors (mobile)',errs.length===0,errs.join(' | '));await page.close()}
 // ================= INVITE MORE / MUTE (owner) =================
 {const GG={'groups/g1':{name:'Клуб',av:'',owner:'u1',members:['u1','u2'],muted:[],ts:1,last:null}};
 const {p:page,e:errs}=await mk(browser,{groups:GG});const db=k=>page.evaluate(k=>window.__FB.db[k],k);
 await page.click('nav [data-i=s]');await page.waitForTimeout(400);await page.click('[data-a=chat][data-i=g_g1]');await page.waitForTimeout(600);
 await page.click('header [data-a=ginfo] >> nth=0');await page.waitForTimeout(300);
 ok('owner: invite-more button and mute buttons',await page.$('dialog [data-a=ginvm]')!==null&&(await page.$$('dialog [data-a=gmute]')).length===1);
 await page.click('dialog [data-a=ginvm]');await page.waitForTimeout(300);
 ok('invite picker excludes members (only Борис offered)',(await page.$$('dialog [data-a=gsel]')).length===1&&(await page.innerText('dialog')).includes('Борис'));
 await page.click('dialog [data-a=ginv2]');await page.waitForTimeout(200);ok('invite picker requires a selection',await page.$('dialog[open] [data-a=ginv2]')!==null);
 await page.click('dialog [data-a=gsel]');await page.click('dialog [data-a=ginv2]');await page.waitForTimeout(500);
 const inv=await db('ginv/g1_u3');ok('invitation written for chosen friend',inv&&inv.from==='u1'&&inv.to==='u3'&&inv.gn==='Клуб',JSON.stringify(inv));
 await page.click('header [data-a=ginfo] >> nth=0');await page.waitForTimeout(300);
 await page.click('dialog [data-a=gmute][data-w=u2]');await page.waitForTimeout(500);
 ok('mute stored',(await db('groups/g1')).muted.includes('u2'));await page.close();
 ok('owner flows: no JS errors',errs.length===0,errs.join(' | '))}
 // ================= MUTED MEMBER =================
 {const GG={'groups/g1':{name:'Клуб',av:'',owner:'u2',members:['u1','u2'],muted:['u1'],ts:1,last:null}};
 const {p:page,e:errs}=await mk(browser,{groups:GG});
 await page.click('nav [data-i=s]');await page.waitForTimeout(400);await page.click('[data-a=chat][data-i=g_g1]');await page.waitForTimeout(600);
 ok('muted member sees notice instead of composer',(await page.innerText('.cw')).includes('отключил вам отправку')&&await page.$('[data-m=ct]')===null);
 await page.click('header [data-a=ginfo] >> nth=0');await page.waitForTimeout(300);
 ok('member sees leave button, no mute controls',await page.$('dialog [data-a=gleave]')!==null&&await page.$('dialog [data-a=gmute]')===null&&await page.$('dialog [data-a=gdel]')===null);await page.close();
 ok('muted member: no JS errors',errs.length===0,errs.join(' | '))}
 // ================= DESKTOP =================
 {const {p:page,e:errs}=await mk(browser,{desk:true,vp:{width:1440,height:900},groups:{'groups/g1':{name:'Клуб',av:'',owner:'u1',members:['u1','u2'],muted:[],ts:1,last:null}}});
 const txt=()=>page.innerText('body'),db=k=>page.evaluate(k=>window.__FB.db[k],k);
 ok('desktop: sidebar visible, bottom nav and top header hidden',await page.evaluate(()=>{const d=s=>{const e=document.querySelector(s);return e?getComputedStyle(e).display:'none'};return d('.side')==='flex'&&d('nav')==='none'&&d('header')==='none'}));
 ok('desktop: sidebar has all tabs',(await page.$$('.side .snav button')).length===5);
 ok('desktop: home in two columns',await page.evaluate(()=>{const c=document.querySelector('.hcols');return !!c&&getComputedStyle(c).display==='grid'&&c.children.length===2}));
 await page.screenshot({path:'/tmp/desk_home.png'});
 await page.click('.side [data-i=n]');await page.waitForTimeout(400);
 ok('desktop: categories in grid',await page.evaluate(()=>getComputedStyle(document.querySelector('.cgrid')).display)==='grid');
 await page.screenshot({path:'/tmp/desk_notes.png'});
 await page.click('.side [data-i=c]');await page.waitForTimeout(400);
 ok('desktop: calendar two columns',await page.evaluate(()=>getComputedStyle(document.querySelector('.calw')).display)==='grid');
 await page.screenshot({path:'/tmp/desk_cal.png'});
 await page.click('.side [data-i=s]');await page.waitForTimeout(500);
 ok('desktop: chats split view with placeholder',await page.$('.split .cl')!==null&&(await page.innerText('.cv')).includes('Выберите чат'));
 await page.click('.cl [data-a=chat][data-i=u2]');await page.waitForTimeout(700);
 ok('desktop: chat opens in right pane (list stays)',await page.$('.cv .ctop')!==null&&await page.$('.cl [data-a=chat][data-i=u2].act')!==null&&(await page.$$('.cl [data-a=chat]')).length===3);
 const lay=await page.evaluate(()=>{const c=document.querySelector('.cw').getBoundingClientRect(),ml=document.querySelector('#mlist').getBoundingClientRect();return{cb:Math.round(c.bottom),h:innerHeight,mlb:Math.round(ml.bottom),ct:Math.round(c.top),pos:getComputedStyle(document.querySelector('.cw')).position,sy:scrollY}});
 ok('desktop: composer pinned under messages at window bottom',lay.pos==='static'&&Math.abs(lay.cb-lay.h)<=2&&Math.abs(lay.mlb-lay.ct)<=2,JSON.stringify(lay));
 ok('desktop: date separators work in pane',(await page.$$('.cv .dsep')).length===2);
 await page.evaluate(()=>{const l=document.querySelector('#mlist');for(let i=0;i<60;i++){const d=document.createElement('div');d.style.height='50px';d.textContent='x';l.appendChild(d)}l.scrollTop=0});
 await page.click('.cv .dsep >> nth=0');await page.waitForTimeout(300);ok('desktop: date calendar opens',await page.$('dialog[open] .cal')!==null);
 await page.click('dialog[open] .cal .y >> nth=0');await page.waitForTimeout(800);
 ok('desktop: jump scrolls inside pane only',(await page.evaluate(()=>scrollY))===0);
 await page.fill('[data-m=ct]','Привет с ПК');await page.keyboard.press('Control+Enter');await page.waitForTimeout(500);
 ok('desktop: Ctrl+Enter sends',await page.evaluate(()=>Object.values(window.__FB.db).some(v=>v&&v.x==='Привет с ПК')));
 await page.screenshot({path:'/tmp/desk_chat.png'});
 const st=await page.evaluate(()=>document.querySelector('#mlist').scrollTop);
 await page.evaluate(()=>{document.querySelector('#mlist').scrollTop=0});await page.click('.cl [data-a=chat][data-i=g_g1]');await page.waitForTimeout(600);
 ok('desktop: switch to group chat in same view',(await page.innerText('.ctop')).includes('Клуб')&&await page.$('.cl [data-a=chat][data-i=g_g1].act')!==null);
 await page.keyboard.press('Escape');await page.waitForTimeout(400);
 ok('desktop: Esc closes chat',(await page.innerText('.cv')).includes('Выберите чат'));
 await page.click('.cl [data-a=chat][data-i=u2]');await page.waitForTimeout(500);
 await page.click('.msg >> nth=0',{button:'right'});await page.waitForTimeout(400);
 ok('desktop: right-click on message opens menu',await page.$('dialog[open]')!==null);await page.evaluate(()=>document.querySelector('dialog').close());await page.waitForTimeout(900);
 await page.click('.side .sbtn');await page.waitForTimeout(300);ok('desktop: invitations button in sidebar',await page.$('dialog[open]')!==null);await page.evaluate(()=>document.querySelector('dialog').close());
 await page.click('.side .suser');await page.waitForTimeout(400);ok('desktop: user card opens profile',(await txt()).includes('Профиль')||(await txt()).includes('Выйти'));
 await page.screenshot({path:'/tmp/desk_prof.png'});
 // resize to mobile: layout switches without errors
 await page.setViewportSize({width:390,height:800});await page.waitForTimeout(500);
 ok('resize to phone: bottom nav back, sidebar hidden',await page.evaluate(()=>getComputedStyle(document.querySelector('nav')).display!=='none'&&getComputedStyle(document.querySelector('.side')).display==='none'));
 ok('desktop run: no JS errors',errs.length===0,errs.join(' | '));await page.close()}
 await browser.close();
 const bad=results.filter(r=>r[0]==='FAIL');console.log('TOTAL',results.length,'FAILED',bad.length);
})();
