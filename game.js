// Lights Out — vanilla JS
// Grid state: true = on, false = off
const gridEl = document.getElementById('grid');
const sizeSel = document.getElementById('size');
const rangeEl = document.getElementById('randomness');
const rangeLabel = document.getElementById('randomnessLabel');
const newBtn = document.getElementById('newGame');
const resetBtn = document.getElementById('resetGame');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const dlg = document.getElementById('winDialog');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const playAgain = document.getElementById('playAgain');
const shareBtn = document.getElementById('shareLink');

let N = +sizeSel.value;
let grid = [];
let moves = 0;
let startTime = 0;
let timer = null;
let initialState = null;

function initGrid(n){
  N = n;
  grid = Array.from({length:N}, _ => Array(N).fill(false));
  gridEl.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
  render();
}

function render(){
  gridEl.innerHTML = '';
  for(let r=0;r<N;r++){
    for(let c=0;c<N;c++){
      const tile = document.createElement('button');
      tile.className = 'tile ' + (grid[r][c] ? 'on' : 'off');
      tile.setAttribute('aria-label', `Row ${r+1}, Col ${c+1}`);
      tile.addEventListener('click', () => clickTile(r,c));
      gridEl.appendChild(tile);
    }
  }
}

function inBounds(r,c){ return r>=0 && r<N && c>=0 && c<N; }

function toggle(r,c){
  if(!inBounds(r,c)) return;
  grid[r][c] = !grid[r][c];
}

function clickTile(r,c){
  toggle(r,c);
  toggle(r-1,c);
  toggle(r+1,c);
  toggle(r,c-1);
  toggle(r,c+1);
  moves++;
  movesEl.textContent = moves;
  render();
  if (isWin()) finish();
}

function isWin(){
  for(let r=0;r<N;r++){
    for(let c=0;c<N;c++){
      if(grid[r][c]) return false; // true means "on", we want all off
    }
  }
  return true;
}

function randomize(steps=14){
  // Apply random valid clicks to ensure solvability
  for(let i=0;i<steps;i++){
    const r = Math.floor(Math.random()*N);
    const c = Math.floor(Math.random()*N);
    toggle(r,c); toggle(r-1,c); toggle(r+1,c); toggle(r,c-1); toggle(r,c+1);
  }
  render();
}

function startTimer(){
  startTime = Date.now();
  if(timer) clearInterval(timer);
  timer = setInterval(()=>{
    const s = Math.floor((Date.now()-startTime)/1000);
    timeEl.textContent = formatTime(s);
  }, 250);
}

function formatTime(s){
  const m = Math.floor(s/60);
  const ss = s%60;
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function newPuzzle(){
  initGrid(+sizeSel.value);
  moves = 0;
  movesEl.textContent = '0';
  startTimer();
  randomize(+rangeEl.value);
  initialState = grid.map(row=>row.slice());
}

function resetPuzzle(){
  if(!initialState) return;
  grid = initialState.map(row=>row.slice());
  moves = 0;
  movesEl.textContent = '0';
  startTimer();
  render();
}

function finish(){
  clearInterval(timer);
  finalMoves.textContent = moves;
  finalTime.textContent = timeEl.textContent;
  dlg.showModal();
}

sizeSel.addEventListener('change', newPuzzle);
rangeEl.addEventListener('input', e => rangeLabel.textContent = e.target.value);
newBtn.addEventListener('click', newPuzzle);
resetBtn.addEventListener('click', resetPuzzle);
playAgain.addEventListener('click', ()=>{ dlg.close(); newPuzzle(); });
shareBtn.addEventListener('click', ()=>{
  const url = new URL(window.location.href);
  url.searchParams.set('n', N);
  url.searchParams.set('steps', rangeEl.value);
  navigator.clipboard.writeText(url.toString()).then(()=>{
    shareBtn.textContent = 'Link copied!';
    setTimeout(()=>shareBtn.textContent='Copy share link',1200);
  });
});

// Parse share params (optional)
(function(){
  const p = new URLSearchParams(window.location.search);
  const n = +p.get('n');
  const steps = +p.get('steps');
  if(n) sizeSel.value = String(n);
  if(steps) { rangeEl.value = String(steps); rangeLabel.textContent = String(steps); }
  newPuzzle();
})();