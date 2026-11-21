const {chromium,mk,N,ok,TODAY,TOM,D3,DB}=require('./h111.js');
(async()=>{const browser=await chromium.launch();
 const {p,e}=await mk(browser,{notes:[N(1,'Четверг магнит',{due:TODAY,tasks:[{text:'молоко',done:true},{text:'стейки',done:true},{text:'пельмени',done:false}]}),N(2,'План',{due:TOM,tasks:[{text:'a',done:false}]})],user:{coins:5,pinv:['bg:sunset'],fire:{n:3,last:TODAY,best:3},rf:{u2:1}}});
 ok('boots without errors',e.length===0,e.join(' | '));
 console.log('eco:',JSON.stringify(await DB(p,'eco/u1')));
 await p.screenshot({path:'/tmp/s_home.png'});
 await browser.close()})().catch(x=>{console.error(x);process.exit(1)});
