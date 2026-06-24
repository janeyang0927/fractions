// ==========================================
// 게임 3: 도깨비 저울 배틀!
// ==========================================

const g3State = {
  level: 1, // 1: 동분모, 2: 단위분수
  
  // 문제 분수 정보
  leftFraction: { denom: 5, num: 2 },
  rightFraction: { denom: 5, num: 4 },
  
  // 떡 모양 (circle, square, triangle)
  ricecakeShape: 'circle',
  
  // 접시 매칭 완료 여부
  leftMatched: false,
  rightMatched: false,
  
  // 올린 카드의 데이터
  leftCardData: null,
  rightCardData: null,
  
  // 힌트 사용 여부
  hint1Active: false,
  hint2Active: false
};

// DOM 요소
const g3LevelBtns = document.querySelectorAll('.g3-level-selector .level-btn');
const g3MessageLog = document.querySelector('.g3-message-log');
const g3ScaleBeam = document.getElementById('g3-scale-beam');

const g3PlateLeft = document.getElementById('g3-plate-left');
const g3PlateRight = document.getElementById('g3-plate-right');
const g3PlateLeftContent = document.getElementById('g3-plate-left-content');
const g3PlateRightContent = document.getElementById('g3-plate-right-content');

const g3FractionLeft = document.getElementById('g3-fraction-left');
const g3FractionRight = document.getElementById('g3-fraction-right');

// 부등호 관련 요소 (수정됨)
const g3OpGt = document.getElementById('g3-op-gt');
const g3OpLt = document.getElementById('g3-op-lt');
const g3OperatorDropzone = document.getElementById('g3-operator-dropzone');
const g3LockText = document.getElementById('g3-lock-text');

const g3CardsList = document.getElementById('g3-cards-list');
const g3ResetBtn = document.getElementById('g3-reset-btn');

const g3Hint1Btn = document.getElementById('g3-hint1-btn');
const g3Hint2Btn = document.getElementById('g3-hint2-btn');

// ==========================================
// 게임 3 초기화
// ==========================================
function initGame3() {
  g3State.hint1Active = false;
  g3State.hint2Active = false;
  g3Hint1Btn.classList.remove('active-magic');
  g3Hint2Btn.classList.remove('active-magic');

  // 저울 회전 리셋
  g3ScaleBeam.style.transform = 'rotate(0deg)';
  document.querySelectorAll('.scale-hanger').forEach(hanger => {
    hanger.style.transform = 'rotate(0deg)';
  });

  g3State.leftMatched = false;
  g3State.rightMatched = false;
  g3State.leftCardData = null;
  g3State.rightCardData = null;

  // 부등호 상태 리셋
  g3OpGt.classList.add('locked');
  g3OpLt.classList.add('locked');
  g3OpGt.classList.remove('blink');
  g3OpLt.classList.remove('blink');
  
  g3OperatorDropzone.innerText = '?';
  g3OperatorDropzone.className = 'scale-operator-dropzone';

  // 떡 모양 무작위 결정
  const shapes = ['circle', 'square', 'triangle'];
  g3State.ricecakeShape = shapes[Math.floor(Math.random() * shapes.length)];

  let shapeKo = "동그란 꿀떡";
  if (g3State.ricecakeShape === 'square') shapeKo = "네모난 시루떡";
  if (g3State.ricecakeShape === 'triangle') shapeKo = "세모난 송편";

  g3LockText.innerText = "🔒 먼저 저울 양쪽에 알맞은 떡 카드를 드래그해 올리세요!";
  g3MessageLog.innerText = `이번 판은 맛있는 [${shapeKo}]이 준비되었어요! 저울에 알맞은 떡 카드를 올려 몬스터를 물리치세요!`;

  g3PlateLeftContent.innerHTML = `<span class="drop-placeholder">여기에 떡 카드 놓기</span>`;
  g3PlateRightContent.innerHTML = `<span class="drop-placeholder">여기에 떡 카드 놓기</span>`;

  generateG3Question();

  g3FractionLeft.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center;">
    <span>${g3State.leftFraction.num}</span>
    <div style="width:24px; height:3px; background:#7966D6; margin:3px 0;"></div>
    <span>${g3State.leftFraction.denom}</span>
  </div>`;
  
  g3FractionRight.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center;">
    <span>${g3State.rightFraction.num}</span>
    <div style="width:24px; height:3px; background:#7966D6; margin:3px 0;"></div>
    <span>${g3State.rightFraction.denom}</span>
  </div>`;

  generateCardsDeck();
  initOperatorDragEvents();
}

// ==========================================
// 무작위 문제 생성
// ==========================================
function generateG3Question() {
  if (g3State.level === 1) {
    const denoms = [3, 4, 5, 6, 8];
    const denom = denoms[Math.floor(Math.random() * denoms.length)];
    
    let num1 = Math.floor(Math.random() * (denom - 1)) + 1;
    let num2 = Math.floor(Math.random() * (denom - 1)) + 1;
    while (num1 === num2) {
      num2 = Math.floor(Math.random() * (denom - 1)) + 1;
    }

    g3State.leftFraction = { denom: denom, num: num1 };
    g3State.rightFraction = { denom: denom, num: num2 };
  } else {
    const denoms = [2, 3, 4, 5, 6, 8];
    
    let denom1 = denoms[Math.floor(Math.random() * denoms.length)];
    let denom2 = denoms[Math.floor(Math.random() * denoms.length)];
    while (denom1 === denom2) {
      denom2 = denoms[Math.floor(Math.random() * denoms.length)];
    }

    g3State.leftFraction = { denom: denom1, num: 1 };
    g3State.rightFraction = { denom: denom2, num: 1 };
  }
}

// ==========================================
// 카드 더미 생성
// ==========================================
function generateCardsDeck() {
  g3CardsList.innerHTML = '';

  const cardPool = [];

  if (g3State.level === 1) {
    const denom = g3State.leftFraction.denom;
    const num1 = g3State.leftFraction.num;
    const num2 = g3State.rightFraction.num;

    cardPool.push({ denom: denom, num: num1, id: 'left-ans', shape: g3State.ricecakeShape });
    cardPool.push({ denom: denom, num: num2, id: 'right-ans', shape: g3State.ricecakeShape });

    const availableNums = [];
    for (let n = 1; n <= denom; n++) {
      if (n !== num1 && n !== num2) {
        availableNums.push(n);
      }
    }
    
    availableNums.sort(() => Math.random() - 0.5);

    let dummyIndex = 0;
    while (cardPool.length < 4) {
      if (availableNums.length > 0) {
        const dNum = availableNums.pop();
        cardPool.push({ denom: denom, num: dNum, id: 'dummy-' + dummyIndex++, shape: g3State.ricecakeShape });
      } else {
        const dNum = Math.floor(Math.random() * denom) + 1;
        cardPool.push({ denom: denom, num: dNum, id: 'dummy-' + dummyIndex++, shape: g3State.ricecakeShape });
      }
    }

  } else {
    const denom1 = g3State.leftFraction.denom;
    const denom2 = g3State.rightFraction.denom;

    cardPool.push({ denom: denom1, num: 1, id: 'left-ans', shape: g3State.ricecakeShape });
    cardPool.push({ denom: denom2, num: 1, id: 'right-ans', shape: g3State.ricecakeShape });

    const dummyDenoms = [2, 3, 4, 5, 6, 8];
    const availableDenoms = dummyDenoms.filter(d => d !== denom1 && d !== denom2);

    availableDenoms.sort(() => Math.random() - 0.5);

    let dummyIndex = 0;
    while (cardPool.length < 4) {
      if (availableDenoms.length > 0) {
        const dDenom = availableDenoms.pop();
        cardPool.push({ denom: dDenom, num: 1, id: 'dummy-' + dummyIndex++, shape: g3State.ricecakeShape });
      } else {
        const dDenom = dummyDenoms[Math.floor(Math.random() * dummyDenoms.length)];
        cardPool.push({ denom: dDenom, num: 1, id: 'dummy-' + dummyIndex++, shape: g3State.ricecakeShape });
      }
    }
  }

  cardPool.sort(() => Math.random() - 0.5);

  cardPool.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'g3-ricecake-card';
    cardDiv.setAttribute('draggable', 'true');
    cardDiv.setAttribute('data-denom', card.denom);
    cardDiv.setAttribute('data-num', card.num);
    cardDiv.setAttribute('data-shape', card.shape);

    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'card-svg-container';
    svgWrapper.innerHTML = makeMiniCardSVG(card.denom, card.num, card.shape);
    cardDiv.appendChild(svgWrapper);

    const textLabel = document.createElement('span');
    textLabel.className = 'card-lbl hidden';
    textLabel.innerText = `${card.denom}등분 중 ${card.num}칸`;
    cardDiv.appendChild(textLabel);

    cardDiv.addEventListener('dragstart', (e) => {
      try { initAudioContext(); } catch(err){}
      e.dataTransfer.setData('text/plain', JSON.stringify(card));
      cardDiv.classList.add('dragging');
    });

    cardDiv.addEventListener('dragend', () => {
      cardDiv.classList.remove('dragging');
    });

    g3CardsList.appendChild(cardDiv);
  });

  if (g3State.hint1Active) {
    document.querySelectorAll('.card-lbl').forEach(lbl => lbl.classList.remove('hidden'));
  }
}

function makeMiniCardSVG(denom, num, shape) {
  const targetShape = shape || g3State.ricecakeShape || 'circle';
  const cx = 30;
  const cy = 30;
  const r = 24;
  let paths = '';

  if (targetShape === 'circle') {
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#F5F5F5" stroke="#CFD8DC" stroke-width="2"/>`;

    for (let i = 0; i < denom; i++) {
      const startAngle = (i * 2 * Math.PI) / denom - Math.PI / 2;
      const endAngle = ((i + 1) * 2 * Math.PI) / denom - Math.PI / 2;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const largeArcFlag = (2 * Math.PI / denom) > Math.PI ? 1 : 0;

      if (i < num) {
        paths += `
          <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" 
                fill="#FF8F00" stroke="#E65100" stroke-width="1" />
        `;
      }

      paths += `<line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="#B0BEC5" stroke-width="1.5" />`;
    }

    return `
      <svg viewBox="0 0 60 60" style="width:100%; height:100%;">
        ${paths}
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E65100" stroke-width="2"/>
      </svg>
    `;
  } else if (targetShape === 'square') {
    const bx = 8;
    const by = 14;
    const bw = 44;
    const bh = 32;
    const pieceW = bw / denom;

    paths += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="#F5F5F5" stroke="#CFD8DC" stroke-width="2"/>`;

    for (let i = 0; i < denom; i++) {
      const px = bx + i * pieceW;
      if (i < num) {
        paths += `<rect x="${px}" y="${by}" width="${pieceW}" height="${bh}" fill="#5D4037" stroke="#3E2723" stroke-width="1"/>`;
      }
      if (i > 0) {
        paths += `<line x1="${px}" y1="${by}" x2="${px}" y2="${by + bh}" stroke="#B0BEC5" stroke-width="1.5" stroke-dasharray="2 1"/>`;
      }
    }

    return `
      <svg viewBox="0 0 60 60" style="width:100%; height:100%;">
        ${paths}
        <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="none" stroke="#3E2723" stroke-width="2"/>
      </svg>
    `;
  } else if (targetShape === 'triangle') {
    const ax = 30, ay = 8;
    const bx = 8, by = 48;
    const cxCoord = 52, cyCoord = 48;
    const baseW = cxCoord - bx;
    const pieceW = baseW / denom;

    paths += `<polygon points="${ax},${ay} ${bx},${by} ${cxCoord},${cyCoord}" fill="#F5F5F5" stroke="#CFD8DC" stroke-width="2"/>`;

    for (let i = 0; i < denom; i++) {
      const xStart = bx + i * pieceW;
      const xEnd = bx + (i + 1) * pieceW;

      if (i < num) {
        paths += `<polygon points="${ax},${ay} ${xStart},${by} ${xEnd},${by}" fill="#2E7D32" stroke="#1B5E20" stroke-width="1"/>`;
      }

      if (i > 0) {
        paths += `<line x1="${ax}" y1="${ay}" x2="${xStart}" y2="${by}" stroke="#B0BEC5" stroke-width="1" stroke-dasharray="2 1"/>`;
      }
    }

    return `
      <svg viewBox="0 0 60 60" style="width:100%; height:100%;">
        ${paths}
        <polygon points="${ax},${ay} ${bx},${by} ${cxCoord},${cyCoord}" fill="none" stroke="#1B5E20" stroke-width="2"/>
      </svg>
    `;
  }
}

// ==========================================
// 저울 떡 카드 드롭 처리
// ==========================================
function processCardDrop(side, cardData) {
  const qFraction = (side === 'left') ? g3State.leftFraction : g3State.rightFraction;
  const targetZone = (side === 'left') ? g3PlateLeft : g3PlateRight;

  if (cardData.denom === qFraction.denom && cardData.num === qFraction.num) {
    playDropSound();
    
    if (side === 'left') {
      g3State.leftMatched = true;
      g3State.leftCardData = cardData;
      g3PlateLeftContent.innerHTML = makeMiniCardSVG(cardData.denom, cardData.num, cardData.shape);
    } else {
      g3State.rightMatched = true;
      g3State.rightCardData = cardData;
      g3PlateRightContent.innerHTML = makeMiniCardSVG(cardData.denom, cardData.num, cardData.shape);
    }

    checkG3PlatesReady();
  } else {
    playFailSound();
    shakeElement(targetZone);
    alert(`💡 앗! 이 카드는 ${side === 'left' ? '왼쪽' : '오른쪽'} 분수(${qFraction.num}/${qFraction.denom})와 다른 크기의 떡이에요.`);
  }
}

// ==========================================
// 저울 드롭존 이벤트 바인딩
// ==========================================
[
  { zone: g3PlateLeft, side: 'left' },
  { zone: g3PlateRight, side: 'right' }
].forEach(target => {
  const zone = target.zone;
  const side = target.side;

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');

    try {
      const dataStr = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
      const cardData = JSON.parse(dataStr);
      if (cardData && cardData.type !== 'operator') {
        processCardDrop(side, cardData);
      }
    } catch (err) {
      console.warn("카드 드롭 파싱 오류:", err);
    }
  });

  zone.addEventListener('customdrop', (e) => {
    const cardData = e.detail.data;
    if (cardData && cardData.type !== 'operator') {
      processCardDrop(side, cardData);
    }
  });
});

// 두 카드가 모두 저울에 올려졌는지 확인
function checkG3PlatesReady() {
  if (g3State.leftMatched && g3State.rightMatched) {
    g3OpGt.classList.remove('locked');
    g3OpLt.classList.remove('locked');
    g3OperatorDropzone.classList.add('ready-glow'); // 여기에 드롭하라는 반짝이는 시각 가이드 추가!
    g3LockText.innerText = "🔓 저울 준비 완료! 두 부등호 카드 중 하나를 가운데 [?] 상자로 드래그하세요!";
    
    if (g3State.hint2Active) {
      highlightG3CorrectOperator();
    }
  }
}

// ==========================================
// 부등호 카드 드래그앤드롭 구현 (신규 피처)
// ==========================================
function initOperatorDragEvents() {
  [g3OpGt, g3OpLt].forEach(card => {
    card.addEventListener('dragstart', (e) => {
      if (card.classList.contains('locked')) {
        e.preventDefault();
        playFailSound();
        alert("🔒 먼저 저울 양쪽에 알맞은 떡 카드를 드래그해 올리세요!");
        return;
      }
      try { initAudioContext(); } catch(err){}
      const op = card.getAttribute('data-op');
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'operator', op: op }));
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });
}

// 부등호 드롭존 드래그 이벤트 등록
g3OperatorDropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (g3OpGt.classList.contains('locked')) return; // 잠금 상태면 오버 효과 없음
  g3OperatorDropzone.classList.add('dragover');
});

g3OperatorDropzone.addEventListener('dragleave', () => {
  g3OperatorDropzone.classList.remove('dragover');
});

g3OperatorDropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  g3OperatorDropzone.classList.remove('dragover');

  try {
    const dataStr = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
    const data = JSON.parse(dataStr);
    if (data && data.type === 'operator') {
      processOperatorDrop(data.op);
    }
  } catch (err) {
    console.warn("부등호 파싱 에러:", err);
  }
});

// 모바일 터치 대응 커스텀 드롭 리스너
g3OperatorDropzone.addEventListener('customdrop', (e) => {
  const data = e.detail.data;
  if (data && data.type === 'operator') {
    processOperatorDrop(data.op);
  }
});

// 부등호 판단 비즈니스 로직
function processOperatorDrop(op) {
  // 저울 준비 전이라면 드롭 무시
  if (g3OpGt.classList.contains('locked')) {
    alert("🔒 아직 저울 위에 맞는 떡 카드들을 올려놓지 않았어요!");
    return;
  }

  const leftVal = g3State.leftFraction.num / g3State.leftFraction.denom;
  const rightVal = g3State.rightFraction.num / g3State.rightFraction.denom;
  
  let isCorrect = false;
  if (op === 'gt' && leftVal > rightVal) isCorrect = true;
  if (op === 'lt' && leftVal < rightVal) isCorrect = true;

  if (isCorrect) {
    playSuccessSound();

    // 부등호 드롭존에 정답 부등호 쏙 채우기
    g3OperatorDropzone.innerText = (op === 'gt') ? '>' : '<';
    g3OperatorDropzone.classList.remove('ready-glow'); // 반짝임 효과 끄기
    g3OperatorDropzone.classList.add('matched');

    // 물리 저울 회전 연출
    const angle = (op === 'gt') ? -12 : 12;
    g3ScaleBeam.style.transform = `rotate(${angle}deg)`;

    document.querySelectorAll('.scale-hanger').forEach(hanger => {
      hanger.style.transform = `rotate(${-angle}deg)`;
    });

    g3MessageLog.innerHTML = `<span style="color:#27AE60">🎉 쿵! 저울이 무겁게 기우뚱하며 몬스터를 해치웠어요!</span>`;

    setTimeout(() => {
      addCoins(10);
    }, 800);

  } else {
    playFailSound();
    shakeElement(g3OperatorDropzone);

    // 저울 쉐이크
    g3ScaleBeam.classList.add('shake-beam');
    setTimeout(() => {
      g3ScaleBeam.classList.remove('shake-beam');
    }, 500);

    g3MessageLog.innerText = "앗! 부등호 방향이 다른 것 같아요. 떡 크기를 눈으로 다시 한 번 비교해 볼까요?";
  }
}

// 저울 비우기
g3ResetBtn.addEventListener('click', () => {
  playClickSound();
  initGame3();
});

// ==========================================
// 힌트 마법 핸들러
// ==========================================

// 1단계: 조각 수 돋보기 마법 -2코인
g3Hint1Btn.addEventListener('click', () => {
  if (g3State.hint1Active) return;
  if (deductCoins(2)) {
    g3State.hint1Active = true;
    g3Hint1Btn.classList.add('active-magic');
    document.querySelectorAll('.card-lbl').forEach(lbl => lbl.classList.remove('hidden'));
  }
});

// 2단계: 정답 거울 마법 -4코인
g3Hint2Btn.addEventListener('click', () => {
  if (g3State.hint2Active) return;
  if (deductCoins(4)) {
    g3State.hint2Active = true;
    g3Hint2Btn.classList.add('active-magic');

    // 거울 마법: 바로 부등호 잠금 해제 및 반짝임
    g3OpGt.classList.remove('locked');
    g3OpLt.classList.remove('locked');
    g3LockText.innerText = "⏰ 거울 마법 발동! 정답 부등호가 반짝이고 있습니다!";
    
    highlightG3CorrectOperator();
  }
});

function highlightG3CorrectOperator() {
  const leftVal = g3State.leftFraction.num / g3State.leftFraction.denom;
  const rightVal = g3State.rightFraction.num / g3State.rightFraction.denom;
  
  if (leftVal > rightVal) {
    g3OpGt.classList.add('blink');
  } else if (leftVal < rightVal) {
    g3OpLt.classList.add('blink');
  }
}

// 레벨 변경
g3LevelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    playClickSound();
    
    g3LevelBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    g3State.level = parseInt(btn.getAttribute('data-level'), 10);
    initGame3();
  });
});

// UI 흔들림 효과
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
initGame3();
