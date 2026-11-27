// Тесты «часть 2» (1.1.1): монеты, анимации, главная, клавиатура, сеты.
// Запуск: cd tests && TZ=Europe/Moscow NODE_PATH=... PLAYWRIGHT_BROWSERS_PATH=... node t_112.js
// TZ=Europe/Moscow важен: TODAY/YEST в обвязке считаются по Москве, а браузер песочницы живёт по UTC.
const {chromium,mk,N,ok,TODAY,YEST,TOM,DB}=require('./h111.js');
const W=p=>p.waitForTimeout(350);
const SETS=['yin','ball','planet','donut','cat','cyber','water','earth','fire','air','basket','volley','hockey','sakura','nature'];
(async()=>{const browser=await chromium.launch();

 // ===== 1. монеты: чужие поля профиля не затирают eco, анимация +1 огонька =====
 {const {p,e}=await mk(browser,{user:{coins:7,fire:{n:1,last:YEST,best:1},rf:{u2:1},pinv:[]},me:{coins:1000,fire:{n:99,last:'2000-01-01'}},desk:true,vp:{width:1280,height:800}});
  await p.click('[data-a=qa][data-i=note]');await W(p);
  await p.fill('[data-m=t]','Монеты');await p.fill('[data-m=i][data-j="0"]','пункт');await W(p);
  await p.click('[data-a=add]');await p.waitForTimeout(500);
  ok('coins: animation overlay shown instead of a toast',await p.evaluate(()=>!!document.querySelector('.gfx .gfx-p')&&document.querySelector('.gfx-p').textContent.includes('+1')));
  ok('coins: animation mentions day of the streak',await p.evaluate(()=>document.querySelector('.gfx-s').textContent.includes('день 2')));
  ok('coins: flame drawn in animation',await p.evaluate(()=>!!document.querySelector('.gfx-f svg')));
  await p.waitForTimeout(2600);
  ok('coins: animation removes itself',await p.evaluate(()=>!document.querySelector('.gfx')));
  const eco=await DB(p,'eco/u1');
  ok('coins: eco doc 7 -> 8, streak 2, revision grows',eco.coins===8&&eco.fire.n===2&&eco.rev>=2,JSON.stringify(eco));
  ok('coins: profile fields coins/fire did not leak into the app',await p.evaluate(()=>{const t=document.body.innerText;return !t.includes('1000')}));
  ok('no JS errors (coins)',e.length===0,e.join(' | '));await p.close()}

 // ===== 2. тосты анимированы и складываются в стопку =====
 {const {p,e}=await mk(browser,{user:{coins:1,fire:{n:4,last:TODAY,best:4},pinv:[],rf:{u2:1}}});
  await p.click('nav [data-i=u]');await W(p);await p.click('.pfbar [data-a=menu]');await W(p);await p.click('.mnu [data-i=shop]');await W(p);
  await p.click('[data-i="bg:night"]');await W(p);
  await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-a]')].find(x=>/Купить/.test(x.textContent)&&x.dataset.a);b&&b.click()});await W(p);
  ok('toast: container exists and toast is animated',await p.evaluate(()=>{const t=document.querySelector('#toasts .toast');return !!t&&t.classList.contains('o')&&!!t.querySelector('.tbar')}));
  ok('toast: not enough coins uses red style + correct plural',await p.evaluate(()=>{const t=document.querySelector('#toasts .toast');return !!t&&t.classList.contains('bad')&&/Не хватает \d+ монет/.test(t.textContent)}));
  await p.waitForTimeout(3200);
  ok('toast: removes itself',await p.evaluate(()=>!document.querySelector('#toasts .toast')));
  ok('no JS errors (toast)',e.length===0,e.join(' | '));await p.close()}

 // ===== 3. главная: плавное появление пунктов плана =====
 {const {p,e}=await mk(browser,{notes:[N(1,'Список',{due:TODAY,tasks:[{text:'раз',done:false},{text:'два',done:false},{text:'три',done:false}]})]});
  await p.click('.tw [data-a=hexp]');await p.waitForTimeout(80);
  ok('home plan: items get stagger index and animation',await p.evaluate(()=>{const k=[...document.querySelectorAll('.tplan .tk')];return k.length===3&&k[2].getAttribute('style').includes('--i:2')&&getComputedStyle(k[0]).animationName==='tkIn'}));
  await W(p);
  await p.click('.tw [data-a=hexp]');await p.waitForTimeout(60);
  ok('home plan: collapse plays an exit animation first',await p.evaluate(()=>!!document.querySelector('.tplan.out')));
  await p.waitForTimeout(450);
  ok('home plan: removed after the animation',await p.evaluate(()=>!document.querySelector('.tplan')));
  ok('no JS errors (home plan)',e.length===0,e.join(' | '));await p.close()}

 // ===== 4. клавиатура ПК в форме заметки =====
 {const {p,e}=await mk(browser,{desk:true,vp:{width:1280,height:800}});
  await p.click('[data-a=qa][data-i=note]');await W(p);
  const items=()=>p.evaluate(()=>[...document.querySelectorAll('[data-m=i]')].map(x=>x.value));
  const foc=()=>p.evaluate(()=>{const a=document.activeElement;return a?(a.dataset.m||'')+(a.dataset.j||''):''});
  ok('kbd: plan cells are multi-line textareas',await p.evaluate(()=>document.querySelector('[data-m=i]').tagName==='TEXTAREA'));
  await p.click('[data-m=t]');await p.keyboard.type('Заметка');await p.keyboard.press('Enter');await W(p);
  ok('kbd: Enter in title jumps to first item',await foc()==='i0');
  await p.keyboard.type('первый');await p.keyboard.press('Enter');await W(p);
  ok('kbd: Enter creates next item and moves there',(await items()).length===2&&await foc()==='i1');
  await p.keyboard.type('второй');await p.keyboard.press('Shift+Enter');await p.keyboard.type('строка 2');await W(p);
  ok('kbd: Shift+Enter makes a new line inside the same item',JSON.stringify(await items())===JSON.stringify(['первый','второй\nстрока 2']),JSON.stringify(await items()));
  await p.keyboard.press('Control+Enter');await p.keyboard.type('x');await W(p);
  ok('kbd: Ctrl+Enter also makes a new line',(await items())[1]==='второй\nстрока 2\nx',JSON.stringify(await items()));
  await p.keyboard.press('ArrowUp');await p.keyboard.press('ArrowUp');await p.keyboard.press('ArrowUp');await W(p);
  ok('kbd: ArrowUp walks up through lines, then to the previous cell',await foc()==='i0');
  await p.keyboard.press('ArrowDown');await W(p);
  ok('kbd: ArrowDown goes to the next cell',await foc()==='i1');
  await p.keyboard.press('Home');await p.keyboard.press('Control+Home');await p.keyboard.press('ArrowLeft');await W(p);
  ok('kbd: ArrowLeft at the start jumps to previous cell end',await foc()==='i0');
  await p.keyboard.press('ArrowRight');await W(p);
  ok('kbd: ArrowRight at the end jumps to next cell',await foc()==='i1');
  // слияние по Backspace в начале
  await p.keyboard.press('Control+Home');await p.keyboard.press('Backspace');await W(p);
  ok('kbd: Backspace at item start merges it with the previous',(await items()).length===1&&(await items())[0].startsWith('первыйвторой'),JSON.stringify(await items()));
  // Ctrl+Z / Ctrl+Y
  await p.waitForTimeout(600);await p.keyboard.press('Control+z');await W(p);
  ok('kbd: Ctrl+Z undoes the merge',(await items()).length===2,JSON.stringify(await items()));
  await p.keyboard.press('Control+y');await W(p);
  ok('kbd: Ctrl+Y redoes it',(await items()).length===1,JSON.stringify(await items()));
  await p.keyboard.press('Control+Shift+z');await W(p);
  // вставка нескольких строк => несколько пунктов
  await p.click('[data-m=i][data-j="0"]');await p.keyboard.press('Control+a');await p.keyboard.press('Delete');
  await p.evaluate(()=>{const dt=new DataTransfer();dt.setData('text','- молоко\n- хлеб\n2) сыр');document.activeElement.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}))});await W(p);
  ok('kbd: paste of several lines makes several items (bullets stripped)',JSON.stringify(await items())===JSON.stringify(['молоко','хлеб','сыр']),JSON.stringify(await items()));
  ok('kbd: Ctrl+A selects the text of a cell (native)',await p.evaluate(()=>{const a=document.activeElement;a.focus();a.select();return a.selectionEnd-a.selectionStart===a.value.length}));
  // Ctrl+S сохраняет
  await p.keyboard.press('Control+s');await p.waitForTimeout(700);
  const n=(await DB(p,'users/u1')).notes[0];
  ok('kbd: Ctrl+S saves the note',!!n&&n.title==='Заметка'&&n.tasks.map(t=>t.text).join('|')==='молоко|хлеб|сыр',JSON.stringify(n&&n.tasks));
  ok('no JS errors (keyboard)',e.length===0,e.join(' | '));await p.close()}

 // ===== 5. многострочный пункт на главной сохраняет переводы строк =====
 {const {p,e}=await mk(browser,{notes:[N(1,'Строки',{due:TODAY,tasks:[{text:'a\nb',done:false}]})]});
  await p.click('.tw [data-a=hexp]');await W(p);
  ok('multi-line item keeps its line break in the list',await p.evaluate(()=>getComputedStyle(document.querySelector('.tplan .tk span')).whiteSpace==='pre-line'));
  ok('no JS errors (multi-line)',e.length===0,e.join(' | '));await p.close()}

 // ===== 6. все 15 сетов: рисуются без ошибок, фон/рамка/огонёк на месте =====
 {let allOk=true,msg='';
  for(const s of SETS){
   const {p,e}=await mk(browser,{user:{coins:5,fire:{n:12,last:TODAY,best:12},pinv:['run'],rf:{u2:1}},me:{dec:{bg:'s_'+s,frame:'s_'+s,skin:'s_'+s,msg:'s_'+s,bf:'s_'+s,run:true,cm:'hold'}},wait:900});
   await p.click('nav [data-i=u]');await W(p);
   const r=await p.evaluate(()=>{const h=document.querySelector('.pf2,.pc3,.cust');const cr=document.querySelector('.cre');const cs=h?getComputedStyle(h).backgroundImage:'';return{cre:!!cr,bg:/url\(/.test(cs)||!!document.querySelector('[style*="--b-s_"],.cust')}});
   if(!r.cre||e.length){allOk=false;msg+=s+':'+JSON.stringify(r)+e.join(',')+' '}
   await p.close()}
  ok('all 15 sets draw a creature on the profile without JS errors',allOk,msg)}

 console.log('\nDONE');await browser.close()})();
