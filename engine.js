const SYMBOL_HEIGHT = 60

const START_SPEED = 14
const MIN_SPEED = 2
const DECEL = 0.35

const spinSound=document.getElementById("spinSound")
const stopSound=document.getElementById("stopSound")
const winSound=document.getElementById("winSound")

const symbols = ["🍒","🍋","⭐","🔔","7"]

/* -----------------------
リール配列（固定）
----------------------- */

const reelStrips = [

["🍒","🍋","⭐","🔔","🍒","🍋","⭐","🔔","🍒","7","🍋","⭐","🔔","🍒","🍋","⭐","🔔","🍒","🍋","⭐"],

["🍋","⭐","🔔","🍒","🍋","⭐","🔔","🍒","7","🍋","⭐","🔔","🍒","🍋","⭐","🔔","🍒","🍋","⭐","🔔"],

["⭐","🔔","🍒","🍋","⭐","🔔","🍒","🍋","⭐","🔔","🍒","7","🍋","⭐","🔔","🍒","🍋","⭐","🔔","🍒"]

]

let reelIndex=[0,0,0]
let reelOffset=[0,0,0]

let speed=[0,0,0]

let spinning=[false,false,false]
let stopping=[false,false,false]

let animating=false

/* -----------------------
ゲーム状態
----------------------- */

let coin=100
let bet=0

const result=document.getElementById("result")

/* -----------------------
役定義
----------------------- */

const ROLES = {

NONE:0,
THREE:1,
SEVEN:2

}

let currentRole = ROLES.NONE

let stopIndex=[null,null,null]

/* -----------------------
表示
----------------------- */

function updateCoin(){

document.getElementById("coin").textContent=coin
document.getElementById("bet").textContent=bet

}

function drawReel(n){

let reel=document.getElementById("reel"+(n+1))

let strip = reelStrips[n]

let i=reelIndex[n]

let html=""

for(let k=0;k<4;k++){

let sym=strip[(i+k)%strip.length]

html+=`<div class="symbol">${sym}</div>`

}

reel.innerHTML=`<div class="reelStrip" id="strip${n}">${html}</div>`

}

function drawAll(){

drawReel(0)
drawReel(1)
drawReel(2)

}

drawAll()
updateCoin()

/* -----------------------
BET
----------------------- */

function betCoin(){

if(coin<=0 || bet>=3) return

coin--
bet++

updateCoin()

}

function maxBet(){

while(bet<3 && coin>0){

coin--
bet++

}

updateCoin()

}

/* -----------------------
内部抽選
----------------------- */

function lottery(){

let r=Math.random()

if(r<1/200){

return ROLES.SEVEN

}

if(r<1/30){

return ROLES.THREE

}

return ROLES.NONE

}

/* -----------------------
停止位置探索
----------------------- */

function findSymbol(reel,symbol){

let strip=reelStrips[reel]

for(let i=0;i<strip.length;i++){

if(strip[i]===symbol){

return i-1

}

}

return Math.floor(Math.random()*strip.length)

}

/* -----------------------
停止位置準備
----------------------- */

function prepareStops(){

if(currentRole===ROLES.SEVEN){

stopIndex[0]=findSymbol(0,"7")
stopIndex[1]=findSymbol(1,"7")
stopIndex[2]=findSymbol(2,"7")

return

}

if(currentRole===ROLES.THREE){

let s=symbols[Math.floor(Math.random()*symbols.length)]

stopIndex[0]=findSymbol(0,s)
stopIndex[1]=findSymbol(1,s)
stopIndex[2]=findSymbol(2,s)

return

}

stopIndex=[null,null,null]

}

/* -----------------------
SPIN
----------------------- */

function spin(){

if(spinning.includes(true)) return

if(bet===0){

result.textContent="BETしてください"
return

}

document.getElementById("spinBtn").disabled=true

result.textContent=""

currentRole = lottery()

prepareStops()

for(let i=0;i<3;i++){

spinning[i]=true
stopping[i]=false

speed[i]=START_SPEED

let reel=document.getElementById("reel"+(i+1))

reel.classList.add("fast")

}

spinSound.currentTime=0
spinSound.play()

animating=true

animate()

}

/* -----------------------
アニメーション
----------------------- */

function animate(){

if(!animating) return

for(let i=0;i<3;i++){

if(!spinning[i]) continue

if(stopping[i]){

speed[i]-=DECEL

let reel=document.getElementById("reel"+(i+1))

reel.classList.remove("fast")
reel.classList.add("spinning")

if(speed[i]<MIN_SPEED){

speed[i]=MIN_SPEED

}

}

reelOffset[i]+=speed[i]

if(reelOffset[i]>=SYMBOL_HEIGHT){

reelOffset[i]-=SYMBOL_HEIGHT

reelIndex[i]++

drawReel(i)

if(stopping[i] && speed[i]===MIN_SPEED){

if(stopIndex[i]!==null){

reelIndex[i]=stopIndex[i]

}

reelOffset[i]=0

drawReel(i)

spinning[i]=false

let reel=document.getElementById("reel"+(i+1))

reel.classList.remove("spinning")
reel.classList.remove("fast")

}

}

let strip=document.getElementById("strip"+i)

if(strip){

strip.style.transform=`translateY(-${reelOffset[i]}px)`

}

}

if(!spinning.includes(true)){

animating=false

checkResult()

return

}

requestAnimationFrame(animate)

}

/* -----------------------
STOP
----------------------- */

function stopReel(n){

if(!spinning[n]) return

stopping[n]=true

stopSound.currentTime=0
stopSound.play()

}

/* -----------------------
結果
----------------------- */

function checkResult(){

let r1=reelStrips[0][(reelIndex[0]+1)%reelStrips[0].length]
let r2=reelStrips[1][(reelIndex[1]+1)%reelStrips[1].length]
let r3=reelStrips[2][(reelIndex[2]+1)%reelStrips[2].length]

let win=0

if(r1==="7" && r2==="7" && r3==="7"){

win=100

}
else if(r1===r2 && r2===r3){

win=20

}

addCoinAnimated(win)

bet=0

updateCoin()

if(win>0){

result.textContent="WIN +"+window

winSound.currentTime=0
winSound.play()

let machine=document.getElementById("machine")

machine.classList.add("winFlash")

setTimeout(()=>{

machine.classList.remove("winFlash")

},2000)

}else{

result.textContent="LOSE"

}

function addCoinAnimated(amount){

let add=0

let timer=setInterval(()=>{

coin++

add++

updateCoin()

if(add>=amount){

clearInterval(timer)

}

},40)

}

document.getElementById("spinBtn").disabled=false

}