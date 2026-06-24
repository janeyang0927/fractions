// ==========================================
// 게임 1: 똑같이 나눠라! 도깨비 떡 썰기
// ==========================================

const g1State = {
  questionDenominator: 4, // 문제 분모
  questionNumerator: 2,   // 문제 분자
  ricecakeShape: 'circle', // 떡 모양 ('circle' | 'square' | 'triangle')
  currentSlices: 1,       // 현재 떡을 자른 수 (초기 1)
  sliceFilledState: [],   // 각 조각의 색칠 여부 (boolean 배열)
  
  // 힌트 사용 여부
  hint1Active: false,
  hint2Active: false
};

// DOM 요소
const g1Goblin = document.getElementById('g1-goblin');
const g1QuestionText = document.getElementById('g1-question-text');
const g1NumeratorInput = document.getElementById('g1-numerator');
const g1DenominatorInput = document.getElementById('g1-denominator');
const g1SubmitBtn = document.getElementById('g1-submit-btn');

const g1Hint1Btn = document.getElementById('g1-hint1-btn');
const g1Hint2Btn = document.getElementById('g1-hint2-btn');
const g1LabelsHint = document.getElementById('g1-labels-hint');
const g1CounterHint = document.getElementById('g1-counter-hint');
const g1TotalCntSpan = document.getElementById('g1-total-cnt');
const g1FilledCntSpan = document.getElementById('g1-filled-cnt');

const g1Canvas = document.getElementById('game1-canvas');
const g1Ctx = g1Canvas.getContext('2d');

const cutButtons = document.querySelectorAll('.cut-btn');

// 캔버스 상수
const CANVAS_CENTER = { x: 170, y: 170 };
const RICECAKE_RADIUS = 130;

// ==========================================
// 게임 1 초기화
// ==========================================
function initGame1() {
  g1State.hint1Active = false;
  g1State.hint2Active = false;
  g1Hint1Btn.classList.remove('active-magic');
  g1Hint2Btn.classList.remove('active-magic');
  g1LabelsHint.classList.add('hidden');
  g1CounterHint.classList.add('hidden');

  g1Goblin.className = "goblin-character pink-goblin";
  const mouth = g1Goblin.querySelector('.goblin-mouth');
  if (mouth) mouth.setAttribute('d', 'M 45 62 Q 50 67 55 62'); // 미소

  g1NumeratorInput.value = '';
  g1DenominatorInput.value = '';

  const denoms = [2, 3, 4, 5, 6, 8];
  g1State.questionDenominator = denoms[Math.floor(Math.random() * denoms.length)];
  g1State.questionNumerator = Math.floor(Math.random() * (g1State.questionDenominator - 1)) + 1;

  // 떡 모양 무작위 결정
  const shapes = ['circle', 'square', 'triangle'];
  g1State.ricecakeShape = shapes[Math.floor(Math.random() * shapes.length)];

  let shapeKo = "동그란 꿀떡";
  let titleKo = "꿀맛 동그라미 꿀떡";
  if (g1State.ricecakeShape === 'square') {
    shapeKo = "네모난 시루떡";
    titleKo = "고소한 네모 시루떡";
  } else if (g1State.ricecakeShape === 'triangle') {
    shapeKo = "세모난 송편";
    titleKo = "쫄깃한 세모 송편";
  }

  const titleEl = document.querySelector('#game1-container .canvas-header h3');
  if (titleEl) titleEl.innerText = titleKo;

  g1QuestionText.innerHTML = `안녕! 나는 떡을 엄청 좋아하는 아기 도깨비야! ✨<br><strong>전체 떡 1판(크기 1)을 똑같이 ${g1State.questionDenominator}조각</strong>으로 나눈 것 중 <strong>${g1State.questionNumerator}조각</strong>만큼 맛있는 떡을 만들어 줄래?`;

  g1State.currentSlices = 1;
  g1State.sliceFilledState = [false];

  cutButtons.forEach(btn => btn.classList.remove('active'));

  drawRicecake();
  updateG1CounterHint();
}

// ==========================================
// 떡 캔버스 드로잉 함수 (다양한 모양 분기 및 대비 선명화)
// ==========================================
function drawRicecake() {
  g1Ctx.clearRect(0, 0, g1Canvas.width, g1Canvas.height);
  const cx = CANVAS_CENTER.x;
  const cy = CANVAS_CENTER.y;
  const r = RICECAKE_RADIUS;
  const slices = g1State.currentSlices;

  if (g1State.ricecakeShape === 'circle') {
    // 1. 원형 떡 그리기
    for (let i = 0; i < slices; i++) {
      const startAngle = (i * 2 * Math.PI) / slices - Math.PI / 2;
      const endAngle = ((i + 1) * 2 * Math.PI) / slices - Math.PI / 2;

      g1Ctx.beginPath();
      g1Ctx.moveTo(cx, cy);
      g1Ctx.arc(cx, cy, r, startAngle, endAngle);
      g1Ctx.closePath();

      if (g1State.sliceFilledState[i]) {
        // 색칠됨 (선명한 오렌지 꿀색 그라디언트)
        const grad = g1Ctx.createRadialGradient(cx, cy, 20, cx, cy, r);
        grad.addColorStop(0, '#FFD54F');
        grad.addColorStop(1, '#FF8F00');
        g1Ctx.fillStyle = grad;
      } else {
        // 색칠 안 됨 (밝은 크림 미색 백설기 느낌)
        const grad = g1Ctx.createRadialGradient(cx, cy, 20, cx, cy, r);
        grad.addColorStop(0, '#FAFAFA');
        grad.addColorStop(1, '#ECEFF1');
        g1Ctx.fillStyle = grad;
      }
      g1Ctx.fill();

      g1Ctx.strokeStyle = '#CFD8DC';
      g1Ctx.lineWidth = 2;
      g1Ctx.stroke();
    }

    // 등분선 그리기
    if (slices > 1) {
      for (let i = 0; i < slices; i++) {
        const angle = (i * 2 * Math.PI) / slices - Math.PI / 2;
        g1Ctx.beginPath();
        g1Ctx.moveTo(cx, cy);
        g1Ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        
        g1Ctx.strokeStyle = '#B0BEC5';
        g1Ctx.lineWidth = 4;
        g1Ctx.lineCap = 'round';
        g1Ctx.stroke();
      }
    }

    // 외각 테두리
    g1Ctx.beginPath();
    g1Ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    g1Ctx.strokeStyle = '#FF8F00';
    g1Ctx.lineWidth = 6;
    g1Ctx.stroke();

  } else if (g1State.ricecakeShape === 'square') {
    // 2. 사각형 떡 그리기 (시루떡)
    // 전체 영역: x = 40, y = 100, width = 260, height = 140
    const bx = 40;
    const by = 100;
    const bw = 260;
    const bh = 140;
    const pieceW = bw / slices;

    for (let i = 0; i < slices; i++) {
      const px = bx + i * pieceW;

      g1Ctx.beginPath();
      g1Ctx.rect(px, by, pieceW, bh);
      g1Ctx.closePath();

      if (g1State.sliceFilledState[i]) {
        // 색칠됨 (진한 팥 갈색 그라디언트)
        const grad = g1Ctx.createLinearGradient(px, by, px, by + bh);
        grad.addColorStop(0, '#8D6E63');
        grad.addColorStop(1, '#4E342E');
        g1Ctx.fillStyle = grad;
      } else {
        // 색칠 안 됨 (밝은 크림 미색 백설기 느낌)
        const grad = g1Ctx.createLinearGradient(px, by, px, by + bh);
        grad.addColorStop(0, '#FAFAFA');
        grad.addColorStop(1, '#ECEFF1');
        g1Ctx.fillStyle = grad;
      }
      g1Ctx.fill();

      g1Ctx.strokeStyle = '#CFD8DC';
      g1Ctx.lineWidth = 2;
      g1Ctx.stroke();
    }

    // 세로 등분선 그리기
    if (slices > 1) {
      for (let i = 1; i < slices; i++) {
        const px = bx + i * pieceW;
        g1Ctx.beginPath();
        g1Ctx.moveTo(px, by);
        g1Ctx.lineTo(px, by + bh);
        g1Ctx.strokeStyle = '#B0BEC5';
        g1Ctx.lineWidth = 4;
        g1Ctx.stroke();
      }
    }

    // 외각 테두리
    g1Ctx.beginPath();
    g1Ctx.rect(bx, by, bw, bh);
    g1Ctx.strokeStyle = '#5D4037';
    g1Ctx.lineWidth = 6;
    g1Ctx.stroke();

  } else if (g1State.ricecakeShape === 'triangle') {
    // 3. 삼각형 떡 그리기 (송편)
    // 꼭짓점 A = (170, 40), 밑변 양끝 B = (40, 280), C = (300, 280)
    const ax = 170, ay = 40;
    const bx = 40, by = 280;
    const baseW = 260;
    const pieceW = baseW / slices;

    for (let i = 0; i < slices; i++) {
      const xStart = bx + i * pieceW;
      const xEnd = bx + (i + 1) * pieceW;

      g1Ctx.beginPath();
      g1Ctx.moveTo(ax, ay);
      g1Ctx.lineTo(xStart, by);
      g1Ctx.lineTo(xEnd, by);
      g1Ctx.closePath();

      if (g1State.sliceFilledState[i]) {
        // 색칠됨 (진한 쑥 녹색 그라디언트)
        const grad = g1Ctx.createLinearGradient(170, ay, 170, by);
        grad.addColorStop(0, '#81C784');
        grad.addColorStop(1, '#2E7D32');
        g1Ctx.fillStyle = grad;
      } else {
        // 색칠 안 됨 (밝은 크림 미색 백설기 느낌)
        const grad = g1Ctx.createLinearGradient(170, ay, 170, by);
        grad.addColorStop(0, '#FAFAFA');
        grad.addColorStop(1, '#ECEFF1');
        g1Ctx.fillStyle = grad;
      }
      g1Ctx.fill();

      g1Ctx.strokeStyle = '#CFD8DC';
      g1Ctx.lineWidth = 2;
      g1Ctx.stroke();
    }

    // 꼭짓점에서 밑변으로 뻗는 분할선 그리기
    if (slices > 1) {
      for (let i = 1; i < slices; i++) {
        const xStart = bx + i * pieceW;
        g1Ctx.beginPath();
        g1Ctx.moveTo(ax, ay);
        g1Ctx.lineTo(xStart, by);
        g1Ctx.strokeStyle = '#B0BEC5';
        g1Ctx.lineWidth = 4;
        g1Ctx.stroke();
      }
    }

    // 외각 테두리
    g1Ctx.beginPath();
    g1Ctx.moveTo(ax, ay);
    g1Ctx.lineTo(bx, by);
    g1Ctx.lineTo(bx + baseW, by);
    g1Ctx.closePath();
    g1Ctx.strokeStyle = '#2E7D32';
    g1Ctx.lineWidth = 6;
    g1Ctx.stroke();
  }
}

// ==========================================
// 떡 조각 클릭 판정 (각도 및 수학 기하 판정)
// ==========================================
g1Canvas.addEventListener('click', (e) => {
  const rect = g1Canvas.getBoundingClientRect();
  const scaleX = g1Canvas.width / rect.width;
  const scaleY = g1Canvas.height / rect.height;
  
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  const slices = g1State.currentSlices;
  let sliceIndex = -1;

  if (g1State.ricecakeShape === 'circle') {
    const cx = CANVAS_CENTER.x;
    const cy = CANVAS_CENTER.y;
    const dist = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
    if (dist > RICECAKE_RADIUS) return;

    let angle = Math.atan2(mouseY - cy, mouseX - cx);
    angle += Math.PI / 2;
    if (angle < 0) {
      angle += 2 * Math.PI;
    }
    sliceIndex = Math.floor((angle / (2 * Math.PI)) * slices) % slices;

  } else if (g1State.ricecakeShape === 'square') {
    // 사각형 범위: x: 40 ~ 300, y: 100 ~ 240
    if (mouseX < 40 || mouseX > 300 || mouseY < 100 || mouseY > 240) return;
    const w = 260 / slices;
    sliceIndex = Math.floor((mouseX - 40) / w);
    if (sliceIndex >= slices) sliceIndex = slices - 1;

  } else if (g1State.ricecakeShape === 'triangle') {
    // 삼각형 범위: y: 40 ~ 280
    if (mouseY < 40 || mouseY > 280) return;
    
    const dy = mouseY - 40;
    if (dy < 1) return; // 나눗셈 0 방지

    // y값에 따른 좌우 빗변 경계 계산
    const halfW = (130 * dy) / 240; 
    const xLeft = 170 - halfW;
    const xRight = 170 + halfW;

    if (mouseX < xLeft || mouseX > xRight) return;

    // 꼭짓점(170, 40)과 마우스(mouseX, mouseY)를 통과하는 선이 y=280과 교차하는 x좌표
    const xIntersect = 170 + (mouseX - 170) * (240 / dy);
    
    const w = 260 / slices;
    sliceIndex = Math.floor((xIntersect - 40) / w);
    if (sliceIndex < 0) sliceIndex = 0;
    if (sliceIndex >= slices) sliceIndex = slices - 1;
  }

  if (sliceIndex === -1) return;

  // 효과음 예외 안전 호출
  try { playClickSound(); } catch(err){}

  g1State.sliceFilledState[sliceIndex] = !g1State.sliceFilledState[sliceIndex];

  drawRicecake();
  updateG1CounterHint();
});

// ==========================================
// 떡 자르기 조작 이벤트
// ==========================================
cutButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    try { playDropSound(); } catch(err){}
    
    cutButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const targetSlices = parseInt(btn.getAttribute('data-slices'), 10);
    g1State.currentSlices = targetSlices;
    
    g1State.sliceFilledState = new Array(targetSlices).fill(false);

    drawRicecake();
    updateG1CounterHint();
  });
});

// ==========================================
// 힌트 마법 핸들러
// ==========================================
g1Hint1Btn.addEventListener('click', () => {
  if (g1State.hint1Active) return;
  
  if (deductCoins(2)) {
    g1State.hint1Active = true;
    g1Hint1Btn.classList.add('active-magic');
    g1LabelsHint.classList.remove('hidden');
  }
});

g1Hint2Btn.addEventListener('click', () => {
  if (g1State.hint2Active) return;

  if (deductCoins(4)) {
    g1State.hint2Active = true;
    g1Hint2Btn.classList.add('active-magic');
    g1CounterHint.classList.remove('hidden');
    updateG1CounterHint();
  }
});

function updateG1CounterHint() {
  const total = g1State.currentSlices;
  const filled = g1State.sliceFilledState.filter(v => v).length;

  g1TotalCntSpan.innerText = total;
  g1FilledCntSpan.innerText = filled;
}

// ==========================================
// 정답 체크 및 제출
// ==========================================
g1SubmitBtn.addEventListener('click', () => {
  const numInput = parseInt(g1NumeratorInput.value, 10);
  const denomInput = parseInt(g1DenominatorInput.value, 10);

  if (isNaN(numInput) || isNaN(denomInput)) {
    try { playFailSound(); } catch(err){}
    shakeElement(g1NumeratorInput.parentElement);
    alert("📢 분모와 분자 칸에 숫자를 모두 적어 주세요!");
    return;
  }

  const totalSlices = g1State.currentSlices;
  const filledSlices = g1State.sliceFilledState.filter(v => v).length;

  const canvasCorrect = (totalSlices === g1State.questionDenominator && filledSlices === g1State.questionNumerator);
  const inputCorrect = (denomInput === g1State.questionDenominator && numInput === g1State.questionNumerator);

  if (canvasCorrect && inputCorrect) {
    try { playSuccessSound(); } catch(err){}
    g1Goblin.className = "goblin-character pink-goblin jump";
    
    const mouth = g1Goblin.querySelector('.goblin-mouth');
    if (mouth) mouth.setAttribute('d', 'M 40 60 Q 50 72 60 60');

    setTimeout(() => {
      addCoins(10);
    }, 600);

  } else {
    try { playFailSound(); } catch(err){}
    g1Goblin.className = "goblin-character pink-goblin sad";
    
    const mouth = g1Goblin.querySelector('.goblin-mouth');
    if (mouth) mouth.setAttribute('d', 'M 42 66 Q 50 58 58 66');

    shakeElement(g1SubmitBtn);

    let errorMsg = "도깨비가 고개를 갸우뚱해요! 다시 한 번 살펴볼까요?\n";
    if (!canvasCorrect) {
      errorMsg += "💡 우측 떡의 조각 수나 색칠한 조각이 문제와 다른 것 같아요.";
    } else if (!inputCorrect) {
      errorMsg += "💡 떡은 아주 잘 그렸는데, 왼쪽 분수 입력창에 숫자를 다르게 적은 것 같아요.";
    }
    alert(errorMsg);

    setTimeout(() => {
      g1Goblin.className = "goblin-character pink-goblin";
      if (mouth) mouth.setAttribute('d', 'M 45 62 Q 50 67 55 62');
    }, 2000);
  }
});

function shakeElement(el) {
  el.style.transform = 'translateX(-10px)';
  let count = 0;
  const interval = setInterval(() => {
    count++;
    if (count % 2 === 0) {
      el.style.transform = 'translateX(-10px)';
    } else {
      el.style.transform = 'translateX(10px)';
    }
    if (count > 5) {
      clearInterval(interval);
      el.style.transform = '';
    }
  }, 50);
}

// 스크립트 로드 시 초기 실행
initGame1();
