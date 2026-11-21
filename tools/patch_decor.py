#!/usr/bin/env python3
# Одноразовый патч 1.1.0 (часть 2): магазин украшений + огонёк-персонаж. Оставлен для истории; повторно запускать НЕ нужно.
import re,sys
P='/home/claude/proj/www/index.html'
t=open(P,encoding='utf-8').read()
def rep(old,new,cnt=1):
    global t
    assert t.count(old)==cnt,(t.count(old),old[:90])
    t=t.replace(old,new)

# 1. таблицы и персонаж
a=t.index("THM={gold:");b=t.index("CPI='<svg")
blk=open('/home/claude/proj/tools/patch_js_block.js',encoding='utf-8').read()
t=t[:a]+blk.rstrip('\n')+"\n"+t[b:]

# 2. av передаёт размер в рамку
rep("const fs=u?frSt(u.dec):''","const fs=u?frSt(u.dec,z):''")

# 3. pCard
a=t.index("function pCard(F,mine){");b=t.index("function PROF(){")
t=t[:a]+r'''function pCard(F,mine){const d=F.dec||{},cm=crMode(d,'c'+(F.uid||'me')),h=cm==='name'?34:cm==='hold'?52:46,nm=`<b>${E(F.name)}</b>`;return`<div class="pc3${d.bg?' cust':''}${cm==='sit'?' m-sit':cm==='lift'?' m-lift':''}" style="--lu:-${Math.round(12*46/56)}px;${d.bg?bgSt(d):''}"><div class="r1"><div class="pa"><button data-a="zoomav" data-i="${F.uid||U.uid}" style="padding:0;display:block;border-radius:50%" aria-label="Фото">${av({...F,uid:''},92)}</button>${cm?(cm==='sit'||cm==='lift'||cm==='hold'?crw(F,mine,cm,h):''):fBadge(F,mine,24)}</div><div class="nm">${cm==='name'?`<div class="nmr">${nm}${crEl(F,mine,'name',h)}</div>`:nm}<span class="plg" role="button" data-a="cplog" data-i="${E(F.login)}">@${E(F.login)}${CPI}</span></div></div><div class="bi${F.bio?'':' e'}${bfCl(d)}">${F.bio?E(F.bio):'Нет описания'}</div></div><div class="pc3i">PastCard ID: ${pidS(F)}</div>`}
'''+t[b:]

# 4. PROF
rep("${WAVE}${d.run?`<div class=\"runner\">${flSv(30,d.skin)}</div>`:''}","${WAVE}")
rep("function PROF(){const u=me(),d=u.dec||{},f=fireOf(u,true),","function PROF(){const u=me(),d=u.dec||{},f=fireOf(u,true),cm=crMode(d,'me'),")
rep('<div class="pf-av"><div class="pf-ring','<div class="pf-av${cm===\'sit\'?\' m-sit\':cm===\'lift\'?\' m-lift\':\'\'}" style="--lu:-14px"><div class="pf-ring')
rep("${cr?`<span class=\"pf-crown\">${CROWN}</span>`:''}</div><div class=\"pf-name\">${E(u.name)}</div>","${cr?`<span class=\"pf-crown\">${CROWN}</span>`:''}${cm==='sit'||cm==='lift'?crw(u,true,cm,64):''}</div>${cm==='name'?`<div class=\"pf-nmr\"><div class=\"pf-name\">${E(u.name)}</div>${crEl(u,true,'name',44)}</div>`:`<div class=\"pf-name\">${E(u.name)}</div>`}")
rep("${flm(u,true,34)}<div><b>${f.n}</b>","${cm==='hold'?`<div class=\"flm cr\">${crEl(u,true,'hold',56)}</div>`:cm?'':flm(u,true,34)}<div><b>${f.n}</b>")
rep('<div class="pf-bio${u.bio?\'\':\' e\'}">','<div class="pf-bio${u.bio?\'\':\' e\'}${bfCl(d)}">')

# 5. profV: честная карточка «как видят другие» + новый случайный режим при открытии
rep("pCard(F,mine&&!pv)","pCard(F,mine)")
rep("c=CHS.find(c=>c.members.includes(id));openD(","c=CHS.find(c=>c.members.includes(id));if(!(d.open&&d.dataset.k==='prof'))RMC={};openD(")
rep("else if(a==='tab'){if(i!==tab||ch||acs){","else if(a==='tab'){RMC={};if(i!==tab||ch||acs){")

# 6. редактор
rep("dec:{bg:'',frame:'',skin:'',msg:'',run:false,...(u.dec||{})},dirty:false","dec:{bg:'',frame:'',skin:'',msg:'',bf:'',run:false,cm:'',...(u.dec||{})},dirty:false")
rep("const d={bg:'',frame:'',skin:'',msg:'',run:false,...(u.dec||{})};eqApply","const d={bg:'',frame:'',skin:'',msg:'',bf:'',run:false,cm:'',...(u.dec||{})};eqApply")
rep("${mk('frame','Рамка аватарки')}${pOwn('run')?`<div class=\"sw\" data-a=\"epq\" data-k=\"eqrun\" data-i=\"run\" style=\"margin-top:10px\"><span>Бегущий огонёк на фоне</span><b class=\"${d.run?'on':''}\"></b></div>`:''}",
"${mk('frame','Рамка аватарки')}${mk('bf','Рамка описания')}${pOwn('run')?`<div class=\"sw\" data-a=\"epq\" data-k=\"eqrun\" data-i=\"run\" style=\"margin-top:10px\"><span>Живой огонёк</span><b class=\"${d.run?'on':''}\"></b></div>${d.run?`<div class=\"sm\" style=\"margin-top:10px\">Где живёт огонёк</div><div class=\"chips\" style=\"flex-wrap:wrap\">${[['rand','Случайно'],['sit','На аватарке'],['lift','Поднимает аву'],['name','У ника'],['hold','Держит число']].map(z=>`<button class=\"chip ${(d.cm||'rand')===z[0]?'on':''}\" data-a=\"epq\" data-k=\"eqcm\" data-i=\"${z[0]}\">${z[1]}</button>`).join('')}</div>`:''}`:''}")
rep("if(k!=='eqx'&&k!=='eqrun'&&!pOwn(i)){toast('Сначала купите это в магазине');return}eqApply(EP.dec,k,i)","if(k!=='eqx'&&k!=='eqrun'&&k!=='eqcm'&&!pOwn(i)){toast('Сначала купите это в магазине');return}eqApply(EP.dec,k,i)")
rep("else if(a==='eqrun')d.run=!d.run;else if(i.startsWith('set:')){const t=i.slice(4);d.bg='s_'+t;d.frame='s_'+t;d.skin='s_'+t;d.msg='s_'+t;d.run=true}",
"else if(a==='eqrun')d.run=!d.run;else if(a==='eqcm')d.cm=i==='rand'?'':i;else if(i.startsWith('set:')){const t=i.slice(4);d.bg='s_'+t;d.frame='s_'+t;d.skin='s_'+t;d.msg='s_'+t;if(BFS['s_'+t])d.bf='s_'+t;d.run=true}")

# 7. покупка
rep("toast('Сначала купите «Бегущий огонёк на фоне»')","toast('Сначала купите «Живой огонёк»')")
rep("const keys=i.startsWith('set:')?['bg:s_'+i.slice(4),'frame:s_'+i.slice(4),'skin:s_'+i.slice(4),'msg:s_'+i.slice(4),'run',i]:[i];","const keys=i.startsWith('set:')?setKeys(i.slice(4)):[i];")

# 8. магазин
a=t.index("function SHOPV(){");b=t.index("const MENUH=")
t=t[:a]+r'''function SHOPV(){const u=me(),d=u.dec||{},tabs=[['bg','Фоны'],['frame','Рамки'],['fire','Огонёк'],['bf','Описание'],['msg','Сообщения'],['set','Сеты']],tile=(k,vis,sub)=>{const[t,id]=k.split(':'),o=pOwn(k),on=k==='run'?d.run:t==='set'?false:d[t]===id,lock=t==='skin'&&!pOwn('run');return`<div class="shc">${vis}<div class="shn">${E(pName(k))}${sub||''}</div>${lock?'<span class="sm">нужен «Живой огонёк»</span>':o?(t==='set'?'<span class="own">Куплено</span>':`<button class="own${on?' on':''}" data-a="eqi" data-i="${k}">${on?'Надето ✓':'Применить'}</button>`):`<button class="buy" data-a="buy" data-i="${k}">${COIN}${pPrice(k)}</button>`}</div>`},ids=t=>Object.keys(PCAT[t]).filter(id=>!shHid(t,id));
 let b='';
 if(ST==='bg')b=ids('bg').map(id=>tile('bg:'+id,`<div class="shv" style="${bgSt({bg:id})}"></div>`,BGS[id][3]?' · анимация':'')).join('');
 else if(ST==='frame')b=ids('frame').map(id=>tile('frame:'+id,`<div class="shv"><span class="av" style="width:66px;height:66px;font-size:26px;${frSt({frame:id},66)}">А</span></div>`,FRS[id][3]===2?' · анимация':FRS[id][3]?' · блеск':'')).join('');
 else if(ST==='fire')b=tile('run',`<div class="shv" style="background:#161620">${crDemo('',38)}</div>`,' · 4 режима')+ids('skin').map(id=>tile('skin:'+id,`<div class="shv" style="background:#161620">${crSv(60,id,{mode:'idle',n:7})}</div>`)).join('');
 else if(ST==='bf')b=ids('bf').map(id=>tile('bf:'+id,`<div class="shv"><div class="bf bf-${id} bdemo">Привет!</div></div>`)).join('');
 else if(ST==='msg')b=ids('msg').map(id=>tile('msg:'+id,`<div class="shv"><span class="mbub" style="${MSS[id][2]}">Привет!</span></div>`)).join('');
 else b=Object.keys(SETS).map(t=>{const h=SETS[t],k='set:'+t,o=pOwn(k),sum=setSum(t);return`<div class="shs" style="${bgSt({bg:'s_'+t})}"><div class="shs-o"><div class="shs-p"><span class="av" style="width:58px;height:58px;font-size:24px;${frSt({frame:'s_'+t},58)}">А</span><div class="crw sit" style="${crPlace('sit',40)}">${crSv(40,'s_'+t,{mode:'sit',n:7})}</div></div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:6px"><b style="font-size:18px">Сет «${E(h[0])}»</b><span class="bd">−${Math.round((1-h[1]/sum)*100)}%</span></div><div style="font-size:12px;margin-top:4px">${E(h[2])}</div></div></div><div style="display:flex;align-items:center;gap:8px;font-weight:800">${o?'':`<s style="opacity:.7">${sum}</s>`}${o?'':COIN+h[1]}<button class="${o?'own':'buy'}" style="margin-left:auto" data-a="${o?'eqi':'buy'}" data-i="${k}">${o?'Применить':'Купить набор'}</button></div></div>`}).join('');
 return`<div class="hd" style="margin-bottom:10px"><button class="x" data-a="acb" aria-label="Назад">${IC('back',20)}</button><b class="tt" style="font-size:20px">Магазин</b><div class="pcoin">${COIN}${u.coins||0}</div></div><div class="chips" style="flex-wrap:nowrap;overflow:auto">${tabs.map(z=>`<button class="chip ${ST===z[0]?'on':''}" data-a="stab" data-i="${z[0]}">${z[1]}</button>`).join('')}</div><p class="sm">Монеты: +1 за каждый день с заметкой, +2 за каждые 10 дней подряд, +10 за каждые 100, +1 за каждого нового друга.</p><div class="shg">${b}</div>${SHEET?`<div class="sheet"><div style="flex:1;font-size:13px"><b>Куплено: ${E(pName(SHEET))}</b><div class="sm">Применить сейчас?</div></div><button class="buy" data-a="eqi" data-i="${SHEET}">Применить</button><button class="sm" data-a="shx" style="padding:8px">Позже</button></div>`:''}`}
'''+t[b:]

# 9. CSS: убрать бегущего, добавить новое
rep(".runner{position:absolute;bottom:6px;left:3%;animation:runx 7s ease-in-out infinite alternate;pointer-events:none}\n","")
rep(".runner svg{display:block;animation:bob .45s ease-in-out infinite alternate;filter:drop-shadow(0 0 6px rgba(255,170,0,.7))}\n","")
css=open('/home/claude/proj/tools/patch_css.css',encoding='utf-8').read()
rep("</style></head>",css+"\n</style></head>")

# 10. список изменений
rep("'Монеты и покупки теперь хранятся отдельно и надёжно; исправлены виджеты и установка обновления поверх старой версии'],","'Монеты и покупки теперь хранятся отдельно и надёжно; исправлены виджеты и установка обновления поверх старой версии','Живой огонёк с глазками и ножками: сидит на аватарке, поднимает её, держится за ник или держит своё число (режим выбирается или случайный)','Магазин: новые анимированные фоны, узорные рамки, рамки описания, стили сообщений и сеты Инь-Ян, Футбол, Планета, Пончик, Котик; старое подешевело'],")
open(P,'w',encoding='utf-8').write(t)
print('patched',len(t))
