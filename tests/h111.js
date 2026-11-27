// Общая обвязка тестов 1.1.1
const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('../www/index.html','utf8');
const M={app:fs.readFileSync('mock-app.js','utf8'),auth:fs.readFileSync('mock-auth.js','utf8'),fs:fs.readFileSync('mock-fs.js','utf8')};
const msk=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(d);
const TODAY=msk(new Date()),YEST=msk(new Date(Date.now()-864e5)),TOM=msk(new Date(Date.now()+864e5)),D3=msk(new Date(Date.now()+3*864e5));
const results=[];const ok=(n,c,extra='')=>{results.push([c?'PASS':'FAIL',n]);console.log((c?'PASS':'FAIL')+' | '+n+(c?'':' | '+String(extra).slice(0,300)))};
const seed=(a)=>{const now=Date.now();
 window.__PREF={};
 window.__FB={user:{uid:'u1',email:'x'},db:{
  'profiles/u1':{name:'Алексей',login:'alex',av:'',inv:'ABC123',...(a.me||{})},
  'profiles/u2':{name:'Аня',login:'anya',av:'',inv:'ZZZ',bio:'Люблю чай',dec:{bg:'sunset',frame:'gold',skin:'violet',run:true,msg:'candy'},fn:7,fl:a.today,pid:5},
  'users/u1':{s:{a:'g',tm:1,th:'dark',nf:1,tz:'Europe/Moscow',lv:'1.1.1',au:0},rd:{},sq:[],hist:[],notes:a.notes||[],...(a.user||{})},
  'chats/u1|u2':{members:['u1','u2'],on:true,last:{x:'Привет',ts:now-1000,f:'u2'}},
  'chats/u1|u2/msgs/m1':{f:'u2',x:'Привет',k:[{text:'Пункт A',done:false,tm:'18:30'},{text:'Пункт B',done:false}],dn:false,ts:now-1000,due:''},
  ...(a.extra||{})}};
 window.__CAP={handlers:{},saved:[]};
 window.Capacitor={isNativePlatform:()=>true,registerPlugin:()=>({setData:async()=>{},getPending:async()=>({ops:'[]'}),setSync:async()=>{},diag:async()=>({widgets:0,notes:0}),saveFile:async o=>{window.__CAP.saved.push(o);return{uri:'x'}}}),
  Plugins:{App:{addListener:(n,cb)=>{window.__CAP.handlers[n]=cb},getLaunchUrl:async()=>({url:null}),minimizeApp:()=>{},openUrl:async o=>{window.__CAP.opened=o.url}},
   Preferences:{set:async({key,value})=>{window.__PREF[key]=value},get:async({key})=>({value:window.__PREF[key]===undefined?null:window.__PREF[key]})},
   LocalNotifications:{schedule:async()=>{},getPending:async()=>({notifications:[]}),cancel:async()=>{},requestPermissions:async()=>({}),addListener:()=>{}}}};
};
async function mk(browser,o={}){const ctx=await browser.newContext({viewport:o.vp||{width:390,height:844},hasTouch:!o.desk,permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();const e=[];
 p.on('pageerror',x=>e.push('pageerror: '+x.message));p.on('console',m=>{if(m.type()==='error')e.push('console: '+m.text())});
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('pastmetki.web.app/version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"version":"1.1.0","min":"1.0.0"}'});if(/manifest\.webmanifest|sw\.js|icon-\d+\.png/.test(u))return r.fulfill({status:200,contentType:'text/plain',body:''});if(u.includes('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:M.app});if(u.includes('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:M.auth});if(u.includes('firebase-firestore.js'))return r.fulfill({contentType:'text/javascript',body:M.fs});if(u.includes('fonts.googleapis'))return r.fulfill({contentType:'text/css',body:''});if(u==='http://pm.test/')return r.fulfill({contentType:'text/html',body:html});return r.abort()});
 await p.addInitScript(seed,{today:TODAY,...o});await p.goto('http://pm.test/');await p.waitForTimeout(o.wait||1200);return{p,e,ctx}}
const N=(id,title,o={})=>({id,title,tasks:[],done:false,due:'',cat:'work',body:'',...o});
const DB=(p,k)=>p.evaluate(k=>window.__FB.db[k],k);
module.exports={chromium,mk,N,ok,results,TODAY,YEST,TOM,D3,DB,msk};
