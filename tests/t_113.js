// 1.1.1 ч.3: кружки везде (редактирование заметки, редактирование сообщения, поле ввода в чате). Запуск: node t_113.js
const {chromium,mk,N,ok,TODAY,TOM,D3,DB}=require('./h111.js');
const fs=require('fs');const png=require('os').tmpdir()+'/pm_f3.png';
fs.writeFileSync(png,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64'));
const W=p=>p.waitForTimeout(250);
(async()=>{const browser=await chromium.launch();
 // ===== 1. окно «Редактировать заметку» =====
 {const {p,e}=await mk(browser,{notes:[N(1,'План',{due:TOM,dtm:'10:00',tasks:[{text:'Первый',done:false,tm:'09:00',dd:D3},{text:'Второй',done:false}]})]},);
  await p.click('nav [data-i="n"]');await W(p);await p.click('.cc[data-i=work]').catch(()=>{});await W(p);await p.click('.card:has-text("План") .tt');await W(p);await p.click('[data-a="nedit"]');await W(p);
  ok('edit: 4 circles near title',(await p.$$('#dlg .nft .nfb')).length===4);
  ok('edit: deadline caption',(await p.innerText('#dlg #edc')).includes('Дедлайн')&&(await p.innerText('#dlg #edc')).includes('10:00'));
  ok('edit: item circles + caption',(await p.$$('#dlg .epr .nfb')).length===4&&(await p.innerText('#dlg .epr >> nth=0')).includes('09:00'));
  ok('edit: items are textareas',(await p.$$('#dlg textarea.epi')).length===2);
  await p.fill('#dlg #ed',D3);await W(p);
  ok('edit: caption follows date',(await p.innerText('#dlg #edc')).length>0&&await p.$eval('#dlg #ed',x=>x.closest('.nfb').classList.contains('on')));
  await p.click('#dlg #edc .x');await W(p);
  ok('edit: reset X clears date and time',(await p.inputValue('#dlg #ed'))===''&&(await p.inputValue('#dlg #edt'))==='');
  await p.fill('#dlg #ed',TOM);
  // клавиатура
  await p.click('#dlg .epi >> nth=0');await p.keyboard.press('Home');await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowRight');await p.keyboard.press('Enter');await W(p);
  const vals=async()=>p.$$eval('#dlg .epi',a=>a.map(x=>x.value));
  let v=await vals();ok('edit: Enter splits item',v.length===3&&v[0]==='Пе'&&v[1]==='рвый',JSON.stringify(v));
  await p.keyboard.press('Backspace');await W(p);v=await vals();ok('edit: Backspace at start merges',v.length===2&&v[0]==='Первый',JSON.stringify(v));
  await p.keyboard.press('End');await p.keyboard.press('Shift+Enter');await p.keyboard.type('строка2');v=await vals();ok('edit: Shift+Enter new line in item',v[0]==='Первый\nстрока2',JSON.stringify(v));
  await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');await W(p);
  ok('edit: ArrowDown moves to next item',await p.evaluate(()=>document.activeElement===document.querySelectorAll('#dlg .epi')[1]));
  await p.click('#dlg [data-a="eprow"]');await W(p);await p.keyboard.type('Третий');v=await vals();ok('edit: check circle adds item',v.length===3&&v[2]==='Третий',JSON.stringify(v));
  await p.click('#dlg [data-a="edatt"]');await W(p);
  await p.setInputFiles('#dlg input[data-m=atf][data-k=p]',png);await p.waitForTimeout(800);
  ok('edit: file added in dialog',await p.$('#dlg .atz .ati img')!==null&&await p.$('dialog[open][data-k=ed]')!==null);
  await p.keyboard.press('Control+s');await p.waitForTimeout(500);
  const n=(await DB(p,'users/u1')).notes[0];
  ok('edit: Ctrl+S saved note',n.tasks.length===3&&n.tasks[0].text==='Первый\nстрока2'&&n.tasks[0].dd===D3&&n.due===TOM&&(n.at||[]).length===1,JSON.stringify(n).slice(0,300));
  ok('edit: dialog closed',await p.$('dialog[open]')===null);
  ok('edit: no JS errors',e.length===0,e.join(' | '));await p.close()}
 // ===== 2. редактирование сообщения =====
 {const {p,e}=await mk(browser,{extra:{'chats/u1|u2/msgs/m2':{f:'u1',x:'Моя заметка',k:[{text:'Пункт 1',done:false}],dn:false,ts:Date.now()-500,due:'',at:[]}}});
  await p.click('nav [data-i=s]');await W(p);await p.click('[data-a=chat][data-i=u2]');await W(p);
  await p.evaluate(()=>{});await p.click('[data-lt=m][data-lp=m2]',{button:'right'});await W(p);
  await p.waitForTimeout(900);await p.click('dialog [data-a=med]');await W(p);
  ok('msg edit: circles + item textarea',(await p.$$('#dlg .nft .nfb')).length===4&&(await p.$$('#dlg textarea.epi')).length===1);
  await p.fill('#dlg #ed',D3);await p.fill('#dlg #edt2','12:30');await W(p);
  ok('msg edit: caption shows date and time',(await p.innerText('#dlg #edc')).includes('12:30'));
  await p.click('#dlg [data-a=edatt]');await W(p);await p.setInputFiles('#dlg input[data-m=atf][data-k=d]',[{name:'b.txt',mimeType:'text/plain',buffer:Buffer.from('y')}]);await p.waitForTimeout(600);
  await p.click('#dlg [data-a=emsv]');await p.waitForTimeout(600);
  const m=await DB(p,'chats/u1|u2/msgs/m2');
  ok('msg edit: saved with date, time and attachment',m.due===D3&&m.dtm==='12:30'&&(m.at||[]).length===1&&m.ed===true,JSON.stringify(m).slice(0,300));
  ok('msg edit: file stored',Object.keys(await p.evaluate(()=>window.__FB.db)).filter(k=>k.startsWith('files/')).length===1);
  ok('msg edit: no JS errors',e.length===0,e.join(' | '));await p.close()}
 // ===== 3. поле ввода в чате =====
 {const {p,e}=await mk(browser,{});
  await p.click('nav [data-i=s]');await W(p);await p.click('[data-a=chat][data-i=u2]');await W(p);
  ok('composer: 4 circles',(await p.$$('.cw .tbr .nfb')).length===4);
  ok('composer: old 📅 ⏰ 📎 buttons gone',await p.$('.cw .dbtn')===null&&await p.$('[data-a=catt]')===null);
  await p.fill('[data-m=ct]','Кружки');await p.fill('[data-m=cdt]',D3);await p.fill('[data-m=cdtm]','08:15');await W(p);
  ok('composer: caption pill',(await p.innerText('.cw .nfc')).includes('08:15')&&await p.$eval('[data-m=cdt]',x=>x.closest('.nfb').classList.contains('on')));
  await p.click('[data-a=cplus]');await W(p);
  ok('composer: item is a textarea in new style',await p.$('.cw textarea[data-m=ci]')!==null&&(await p.$$('.cw .cit .nfb')).length===2);
  await p.keyboard.type('один');await p.keyboard.press('Shift+Enter');await p.keyboard.type('два');
  ok('composer: Shift+Enter makes new line',(await p.inputValue('[data-m=ci][data-j="0"]'))==='один\nдва');
  await p.fill('[data-m=cidd][data-j="0"]',D3);await W(p);
  ok('composer: item date caption',(await p.innerText('.cw .cit .nfc')).length>0);
  await p.click('.cw [data-a=atmod][data-g=cmp]');await W(p);
  await p.setInputFiles('#dlg input[data-m=atf]',png);await p.waitForTimeout(800);
  ok('composer: file window opens and adds photo',await p.$('dialog[open][data-k=atm] .ati img')!==null);
  await p.click('#dlg [data-a=atmx]');await W(p);
  ok('composer: + circle marked, thumbnail under title',await p.$eval('.cw [data-a=atmod]',x=>x.classList.contains('on'))&&await p.$('.cw .atl .ati img')!==null);
  await p.click('[data-a=send]');await p.waitForTimeout(600);
  const db=await p.evaluate(()=>window.__FB.db),k=Object.keys(db).find(z=>z.startsWith('chats/u1|u2/msgs/')&&db[z].x==='Кружки'),m=db[k]||{};
  ok('composer: message sent with date, time, item and photo',m.due===D3&&m.dtm==='08:15'&&m.k&&m.k[0].text==='один\nдва'&&m.k[0].dd===D3&&(m.at||[]).length===1,JSON.stringify(m).slice(0,300));
  ok('composer: reset after send',await p.$('.cw .nfc')===null&&(await p.$$('.cw .cit .irw')).length===0);
  // вставка нескольких строк
  await p.click('[data-a=cplus]');await W(p);
  await p.evaluate(()=>{const t=document.querySelector('[data-m=ci]');t.focus();const dt=new DataTransfer();dt.setData('text','- a\n- b\n- c');t.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}))});await W(p);
  ok('composer: multi-line paste = several items',(await p.$$('.cw textarea[data-m=ci]')).length===3);
  ok('composer: no JS errors',e.length===0,e.join(' | '));await p.close()}
 // ===== 4. ПК: тот же вид =====
 {const {p,e}=await mk(browser,{vp:{width:1280,height:800},desk:true,notes:[N(1,'ПК',{tasks:[{text:'п',done:false}]})]});
  await p.click('nav [data-i="n"]').catch(()=>{});await W(p);await p.click('.cc[data-i=work]').catch(()=>{});await W(p);
  const t=await p.$('.card:has-text("ПК") .tt');if(t){await t.click();await W(p);await p.click('[data-a="nedit"]');await W(p);
   ok('desktop: edit dialog circles fit in one row',await p.evaluate(()=>{const f=[...document.querySelectorAll('#dlg .nft .nfb')].map(x=>x.getBoundingClientRect());return f.length===4&&f.every(r=>Math.abs(r.top-f[0].top)<2)}));
   await p.screenshot({path:require('os').tmpdir()+'/pm_ed_desk.png'})}
  ok('desktop: no JS errors',e.length===0,e.join(' | '));await p.close()}
 // ===== 5. регресс: медленный ответ Firebase (на телефоне) не должен оставлять пустой экран =====
 {const {p,e}=await mk(browser,{wait:50});
  await p.addInitScript(()=>{window.__AUTHDELAY=700});await p.reload();await p.evaluate(()=>{});await p.waitForTimeout(100);
  await p.evaluate(()=>{window.__FB.user=null});await p.waitForTimeout(2500);
  ok('slow auth, logged out: welcome screen has buttons (not empty)',await p.evaluate(()=>{const a=document.getElementById('app');return a.querySelectorAll('.wel button').length===2&&!document.querySelector('body>.wel')}));
  ok('slow auth: no JS errors',e.length===0,e.join(' | '));await p.close()}
 {const {p,e}=await mk(browser,{wait:50});
  await p.addInitScript(()=>{window.__AUTHDELAY=800});await p.reload();await p.waitForTimeout(2500);
  ok('slow auth, logged in: app shown, splash gone',await p.evaluate(()=>document.querySelectorAll('#app button').length>5&&!document.querySelector('.spl2')));
  await p.close()}
 await browser.close();console.log('DONE')})();
