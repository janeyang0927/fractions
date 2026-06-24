// ==========================================
// 게임 2: 왁자지껄 도깨비 주문! 조각 떡 배달
// ==========================================

const g2State = {
  // 도깨비 A, B, C 주문 정보
  orders: {
    A: { denom: 2, count: 1, name: '분홍이', goblinClass: 'pink-goblin' },
    B: { denom: 4, count: 3, name: '노랑이', goblinClass: 'yellow-goblin' },
    C: { denom: 3, count: 2, name: '파랑이', goblinClass: 'blue-goblin' }
  },
  // 접시에 드롭된 조각 리스트
  plates: {
    A: [], 
    B: [],
    C: []
  },
  
  // 떡 모양 ('circle' | 'square' | 'triangle')
  ricecakeShape: 'circle',

  // 힌트 활성화 상태
  hint1Active: false,
  hint2Active: false,

  // 배달 성공 여부
  completed: {
    A: false,
    B: false,
    C: false
  }
};

// DOM 요소
const g2ResetBtn = document.getElementById('g2-reset-btn');
const g2Hint1BtnG2 = document.querySelector('#game2-container #g2-hint1-btn');
const g2Hint2BtnG2 = document.querySelector('#game2-container #g2-hint2-btn');

const plateZones = document.querySelectorAll('.plate-zone');

// ==========================================
// 게임 2 초기화
// ==========================================
function initGame2() {
  g2State.hint1Active = false;
  g2State.hint2Active = false;
  g2Hint1BtnG2.classList.remove('active-magic');
  g2Hint2BtnG2.classList.remove('active-magic');

  document.querySelectorAll('.basket-tag').forEach(tag => tag.classList.add('hidden'));

  g2State.plates.A = [];
  g2State.plates.B = [];
  g2State.plates.C = [];
  g2State.completed.A = false;
  g2State.completed.B = false;
  g2State.completed.C = false;

  const denoms = [2, 3, 4, 5];
  const targets = ['A', 'B', 'C'];
  
  // 떡 모양 무작위 결정
  const shapes = ['circle', 'square', 'triangle'];
  g2State.ricecakeShape = shapes[Math.floor(Math.random() * shapes.length)];

  let shapeKo = "동그란 꿀떡";
  let shopTitle = "🍡 동그란 꿀떡 매대 (원하는 떡을 접시로 드래그하세요!)";
  if (g2State.ricecakeShape === 'square') {
    shapeKo = "네모난 시루떡";
    shopTitle = "🍡 네모난 시루떡 매대 (원하는 떡을 접시로 드래그하세요!)";
  } else if (g2State.ricecakeShape === 'triangle') {
    shapeKo = "세모난 송편";
    shopTitle = "🍡 세모난 송편 매대 (원하는 떡을 접시로 드래그하세요!)";
  }

  const shopHeader = document.querySelector('.g2-shop-header h3');
  if (shopHeader) shopHeader.innerText = shopTitle;

  targets.forEach(t => {
    const denom = denoms[Math.floor(Math.random() * denoms.length)];
    const count = Math.floor(Math.random() * denom) + 1;
    
    g2State.orders[t].denom = denom;
    g2State.orders[t].count = count;
  });

  // 주문 텍스트 및 UI 리셋
  targets.forEach(t => {
    const custEl = document.getElementById(`g2-cust-${t}`);
    
    const orderTextEl = custEl.querySelector('.order-text');
    orderTextEl.innerHTML = `나는 <span style="color:#C70039">1/${g2State.orders[t].denom} [${shapeKo}]</span> <strong>${g2State.orders[t].count}개</strong> 줄래?`;

    const goblinEl = custEl.querySelector('.g2-goblin-char');
    goblinEl.className = `g2-goblin-char ${g2State.orders[t].goblinClass}`;
    const mouth = goblinEl.querySelector('.goblin-mouth');
    if (mouth) mouth.setAttribute('d', 'M 45 62 Q 50 67 55 62');

    document.getElementById(`plate-count-${t}`).innerText = '0';

    const inputBox = document.getElementById(`g2-input-box-${t}`);
    inputBox.classList.add('hidden');
    
    // 세로셈 입력칸 리셋
    inputBox.innerHTML = `
      <div class="g2-fraction-wrapper">
        <span>받은 떡은 전체의 </span>
        <div class="vertical-fraction mini">
          <input type="number" class="g2-num" placeholder="?">
          <div class="fraction-line"></div>
          <input type="number" class="g2-denom" placeholder="?">
        </div>
      </div>
      <button class="jelly-btn g2-delivery-btn" data-target="${t}">배달 완료! 🪙</button>
    `;
    
    // 배달 버튼 클릭 리스너 재바인딩
    inputBox.querySelector('.g2-delivery-btn').addEventListener('click', (e) => {
      handleDeliveryClick(t);
    });

    drawPlateSVG(t);
  });

  renderShopBaskets();
}

// ==========================================
// 매대 바구니 동적 렌더링 (다양한 모양 반영)
// ==========================================
function renderShopBaskets() {
  const basketsContainer = document.querySelector('.g2-baskets');
  if (!basketsContainer) return;
  basketsContainer.innerHTML = '';

  const fractions = [
    { frac: '1/2', denom: 2, label: '쑥떡' },
    { frac: '1/3', denom: 3, label: '호박떡' },
    { frac: '1/4', denom: 4, label: '딸기떡' },
    { frac: '1/5', denom: 5, label: '자색고구마떡' }
  ];

  fractions.forEach(f => {
    const basketDiv = document.createElement('div');
    basketDiv.className = 'g2-basket';
    basketDiv.setAttribute('data-fraction', f.frac);

    const tagDiv = document.createElement('div');
    tagDiv.className = 'basket-tag hidden';
    tagDiv.innerText = `${f.frac} 떡`;
    basketDiv.appendChild(tagDiv);

    const dishDiv = document.createElement('div');
    dishDiv.className = 'basket-dish';

    const dragDiv = document.createElement('div');
    dragDiv.className = 'draggable-ricecake';
    dragDiv.setAttribute('draggable', 'true');
    dragDiv.setAttribute('data-denom', f.denom);
    dragDiv.setAttribute('data-num', 1);

    dragDiv.innerHTML = makeBasketRicecakeSVG(f.denom, g2State.ricecakeShape);
    dishDiv.appendChild(dragDiv);
    basketDiv.appendChild(dishDiv);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'basket-label';
    
    let shapeName = "반달 쑥떡";
    if (f.denom === 3) shapeName = "노랑 호박떡";
    if (f.denom === 4) shapeName = "분홍 딸기떡";
    if (f.denom === 5) shapeName = "보라 자색고구마떡";
    
    if (g2State.ricecakeShape === 'square') {
      shapeName = "네모 " + (f.denom === 2 ? "쑥떡" : f.denom === 3 ? "호박떡" : f.denom === 4 ? "딸기떡" : "자색고구마떡");
    } else if (g2State.ricecakeShape === 'triangle') {
      shapeName = "세모 " + (f.denom === 2 ? "쑥떡" : f.denom === 3 ? "호박떡" : f.denom === 4 ? "딸기떡" : "자색고구마떡");
    }

    labelSpan.innerText = `${shapeName} (${f.frac})`;
    basketDiv.appendChild(labelSpan);

    // 드래그 이벤트 등록
    dragDiv.addEventListener('dragstart', (e) => {
      try { initAudioContext(); } catch(err){}
      e.dataTransfer.setData('text/plain', JSON.stringify({ denom: f.denom, num: 1 }));
      dragDiv.classList.add('dragging');
    });

    dragDiv.addEventListener('dragend', () => {
      dragDiv.classList.remove('dragging');
    });

    basketsContainer.appendChild(basketDiv);
  });

  if (g2State.hint1Active) {
    document.querySelectorAll('.basket-tag').forEach(tag => tag.classList.remove('hidden'));
  }
}

// ==========================================
// 바구니 조각 떡 SVG 생성 함수
// ==========================================
function makeBasketRicecakeSVG(denom, shape) {
  let fillCol = '#2E7D32'; // 쑥색
  let strokeCol = '#1B5E20';
  if (denom === 3) { fillCol = '#E65100'; strokeCol = '#BF360C'; } // 단호박
  if (denom === 4) { fillCol = '#C2185B'; strokeCol = '#880E4F'; } // 딸기
  if (denom === 5) { fillCol = '#6A1B9A'; strokeCol = '#4A148C'; } // 자색고구마

  let paths = '';
  
  if (shape === 'circle') {
    const cx = 50, cy = 50, r = 45;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#D0D0D0" stroke-width="2" stroke-dasharray="4 3"/>`;
    
    for (let i = 0; i < denom; i++) {
      const angle = (i * 2 * Math.PI) / denom - Math.PI / 2;
      paths += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="#D0D0D0" stroke-width="1.5" stroke-dasharray="3 2"/>`;
    }

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI) / denom;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArcFlag = ((2 * Math.PI) / denom) > Math.PI ? 1 : 0;
    
    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>`;

  } else if (shape === 'square') {
    const bx = 10, by = 25, bw = 80, bh = 50;
    const pieceW = bw / denom;

    paths += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="none" stroke="#D0D0D0" stroke-width="2" stroke-dasharray="4 3"/>`;

    for (let i = 1; i < denom; i++) {
      const px = bx + i * pieceW;
      paths += `<line x1="${px}" y1="${by}" x2="${px}" y2="${by + bh}" stroke="#D0D0D0" stroke-width="1.5" stroke-dasharray="3 2"/>`;
    }

    paths += `<rect x="${bx}" y="${by}" width="${pieceW}" height="${bh}" rx="2" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>`;

  } else if (shape === 'triangle') {
    const ax = 50, ay = 15;
    const bx = 15, by = 80;
    const baseW = 70;
    const pieceW = baseW / denom;

    paths += `<polygon points="${ax},${ay} ${bx},${by} ${bx+baseW},${by}" fill="none" stroke="#D0D0D0" stroke-width="2" stroke-dasharray="4 3"/>`;

    for (let i = 1; i < denom; i++) {
      const px = bx + i * pieceW;
      paths += `<line x1="${ax}" y1="${ay}" x2="${px}" y2="${by}" stroke="#D0D0D0" stroke-width="1.5" stroke-dasharray="3 2"/>`;
    }

    const xEnd = bx + pieceW;
    paths += `<polygon points="${ax},${ay} ${bx},${by} ${xEnd},${by}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>`;
  }

  return `
    <svg viewBox="0 0 100 100" class="ricecake-svg">
      ${paths}
    </svg>
  `;
}

// ==========================================
// 드래그 앤 드롭 공통 처리 함수
// ==========================================
function processRicecakeDrop(targetKey, data) {
  if (g2State.completed[targetKey]) {
    alert("💡 이미 떡 배달을 성공적으로 마친 도깨비예요!");
    return;
  }

  if (g2State.plates[targetKey].length >= 10) {
    alert("📢 접시가 너무 가득 찼어요! 접시 비우기 버튼을 눌러 다시 담아보세요.");
    return;
  }

  g2State.plates[targetKey].push(data);
  playDropSound();

  drawPlateSVG(targetKey);

  const inputBox = document.getElementById(`g2-input-box-${targetKey}`);
  inputBox.classList.remove('hidden');

  updateG2PlateSpeechHint(targetKey);
}

// ==========================================
// 드래그 앤 드롭 이벤트 구현
// ==========================================
plateZones.forEach(zone => {
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

    const targetKey = zone.getAttribute('data-target');
    try {
      const dataStr = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
      const data = JSON.parse(dataStr);
      processRicecakeDrop(targetKey, data);
    } catch (err) {
      console.warn("드롭 에러:", err);
    }
  });

  zone.addEventListener('customdrop', (e) => {
    const targetKey = zone.getAttribute('data-target');
    const data = e.detail.data;
    if (data) {
      processRicecakeDrop(targetKey, data);
    }
  });
});

// 접시 비우기 버튼 클릭 시
g2ResetBtn.addEventListener('click', () => {
  playClickSound();
  const targets = ['A', 'B', 'C'];
  targets.forEach(t => {
    if (!g2State.completed[t]) {
      g2State.plates[t] = [];
      drawPlateSVG(t);
      document.getElementById(`plate-count-${t}`).innerText = '0';
      document.getElementById(`g2-input-box-${t}`).classList.add('hidden');
      updateG2PlateSpeechHint(t);
    }
  });
});

// ==========================================
// 접시 SVG 드로잉 (다양한 모양 지원)
// ==========================================
function drawPlateSVG(target) {
  const svg = document.getElementById(`plate-svg-${target}`);
  const items = g2State.plates[target];
  
  svg.innerHTML = `<circle cx="50" cy="50" r="45" fill="#FFF" stroke="#EAD2B8" stroke-width="4" stroke-dasharray="4 2"/>`;

  if (items.length === 0) {
    document.getElementById(`plate-count-${target}`).innerText = '0';
    return;
  }

  const shape = g2State.ricecakeShape || 'circle';

  if (shape === 'circle') {
    let currentAngle = -Math.PI / 2;

    items.forEach(item => {
      const angleDelta = (2 * Math.PI) / item.denom;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleDelta;
      currentAngle = endAngle;

      const cx = 50;
      const cy = 50;
      const r = 40;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const largeArcFlag = angleDelta > Math.PI ? 1 : 0;

      let fillCol = '#2E7D32'; 
      let strokeCol = '#1B5E20';
      if (item.denom === 3) { fillCol = '#E65100'; strokeCol = '#BF360C'; }
      if (item.denom === 4) { fillCol = '#C2185B'; strokeCol = '#880E4F'; }
      if (item.denom === 5) { fillCol = '#6A1B9A'; strokeCol = '#4A148C'; }

      const pathData = `
        M ${cx} ${cy}
        L ${x1} ${y1}
        A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', fillCol);
      path.setAttribute('stroke', strokeCol);
      path.setAttribute('stroke-width', '1.5');
      svg.appendChild(path);
    });

  } else if (shape === 'square') {
    const bx = 15, by = 25, bw = 70, bh = 50;
    const denom = items[0].denom;
    const pieceW = bw / denom;

    const borderRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    borderRect.setAttribute('x', bx);
    borderRect.setAttribute('y', by);
    borderRect.setAttribute('width', bw);
    borderRect.setAttribute('height', bh);
    borderRect.setAttribute('fill', 'none');
    borderRect.setAttribute('stroke', '#EAD2B8');
    borderRect.setAttribute('stroke-width', '1.5');
    borderRect.setAttribute('stroke-dasharray', '3 2');
    borderRect.setAttribute('rx', '4');
    svg.appendChild(borderRect);

    items.forEach((item, index) => {
      const px = bx + index * pieceW;

      let fillCol = '#2E7D32'; 
      let strokeCol = '#1B5E20';
      if (item.denom === 3) { fillCol = '#E65100'; strokeCol = '#BF360C'; }
      if (item.denom === 4) { fillCol = '#C2185B'; strokeCol = '#880E4F'; }
      if (item.denom === 5) { fillCol = '#6A1B9A'; strokeCol = '#4A148C'; }

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', px);
      rect.setAttribute('y', by);
      rect.setAttribute('width', pieceW);
      rect.setAttribute('height', bh);
      rect.setAttribute('fill', fillCol);
      rect.setAttribute('stroke', strokeCol);
      rect.setAttribute('stroke-width', '1.5');
      rect.setAttribute('rx', '2');
      svg.appendChild(rect);
    });

  } else if (shape === 'triangle') {
    const ax = 50, ay = 15;
    const bx = 15, by = 80;
    const baseW = 70;
    const denom = items[0].denom;
    const pieceW = baseW / denom;

    const borderTri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    borderTri.setAttribute('points', `${ax},${ay} ${bx},${by} ${bx+baseW},${by}`);
    borderTri.setAttribute('fill', 'none');
    borderTri.setAttribute('stroke', '#EAD2B8');
    borderTri.setAttribute('stroke-width', '1.5');
    borderTri.setAttribute('stroke-dasharray', '3 2');
    svg.appendChild(borderTri);

    items.forEach((item, index) => {
      const xStart = bx + index * pieceW;
      const xEnd = bx + (index + 1) * pieceW;

      let fillCol = '#2E7D32'; 
      let strokeCol = '#1B5E20';
      if (item.denom === 3) { fillCol = '#E65100'; strokeCol = '#BF360C'; }
      if (item.denom === 4) { fillCol = '#C2185B'; strokeCol = '#880E4F'; }
      if (item.denom === 5) { fillCol = '#6A1B9A'; strokeCol = '#4A148C'; }

      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `${ax},${ay} ${xStart},${by} ${xEnd},${by}`);
      poly.setAttribute('fill', fillCol);
      poly.setAttribute('stroke', strokeCol);
      poly.setAttribute('stroke-width', '1.5');
      svg.appendChild(poly);
    });
  }

  document.getElementById(`plate-count-${target}`).innerText = items.length;
}

// ==========================================
// 힌트 마법 핸들러
// ==========================================
g2Hint1BtnG2.addEventListener('click', () => {
  if (g2State.hint1Active) return;
  if (deductCoins(2)) {
    g2State.hint1Active = true;
    g2Hint1BtnG2.classList.add('active-magic');
    document.querySelectorAll('.basket-tag').forEach(tag => tag.classList.remove('hidden'));
  }
});

g2Hint2BtnG2.addEventListener('click', () => {
  if (g2State.hint2Active) return;
  if (deductCoins(4)) {
    g2State.hint2Active = true;
    g2Hint2BtnG2.classList.add('active-magic');
    ['A', 'B', 'C'].forEach(t => updateG2PlateSpeechHint(t));
  }
});

function updateG2PlateSpeechHint(target) {
  if (!g2State.hint2Active || g2State.completed[target]) return;

  const items = g2State.plates[target];
  const custEl = document.getElementById(`g2-cust-${target}`);
  const orderTextEl = custEl.querySelector('.order-text');

  let shapeKo = "꿀떡";
  if (g2State.ricecakeShape === 'square') shapeKo = "시루떡";
  if (g2State.ricecakeShape === 'triangle') shapeKo = "송편";

  if (items.length === 0) {
    orderTextEl.innerHTML = `나는 <span style="color:#C70039">1/${g2State.orders[target].denom} [${shapeKo}]</span> <strong>${g2State.orders[target].count}개</strong> 줄래?`;
  } else {
    const countsByDenom = {};
    items.forEach(item => {
      countsByDenom[item.denom] = (countsByDenom[item.denom] || 0) + 1;
    });

    let hintString = "지금 접시에 ";
    const parts = [];
    for (const d in countsByDenom) {
      parts.push(`1/${d} 조각이 ${countsByDenom[d]}개`);
    }
    hintString += parts.join(', ') + " 모였어!";

    orderTextEl.innerHTML = `<span style="color:#7966D6; font-size:13px;">💡 ${hintString}</span>`;
  }
}

// ==========================================
// 도깨비별 배달 검증 및 제출 (핵심 버그 수정)
// ==========================================
function handleDeliveryClick(target) {
  const order = g2State.orders[target];
  const plateItems = g2State.plates[target];

  const inputBox = document.getElementById(`g2-input-box-${target}`);
  const numInput = parseInt(inputBox.querySelector('.g2-num').value, 10);
  const denomInput = parseInt(inputBox.querySelector('.g2-denom').value, 10);

  const custEl = document.getElementById(`g2-cust-${target}`);
  const goblinEl = custEl.querySelector('.g2-goblin-char');
  const mouth = goblinEl.querySelector('.goblin-mouth');

  if (isNaN(numInput) || isNaN(denomInput)) {
    try { playFailSound(); } catch(err){}
    shakeElement(inputBox);
    alert("📢 접시 옆 빈칸에 분모와 분자를 채워주세요!");
    return;
  }

  const isRicecakeCorrectSize = plateItems.every(item => item.denom === order.denom);
  const isRicecakeCountCorrect = (plateItems.length === order.count);
  const isRicecakeCorrect = isRicecakeCorrectSize && isRicecakeCountCorrect;

  const isInputCorrect = (denomInput === order.denom && numInput === order.count);

  if (isRicecakeCorrect && isInputCorrect) {
    try { playSuccessSound(); } catch(err){}
    g2State.completed[target] = true;

    goblinEl.className = `g2-goblin-char ${order.goblinClass} jump`;
    if (mouth) mouth.setAttribute('d', 'M 40 60 Q 50 72 60 60');

    inputBox.innerHTML = `<span style="color:#27AE60; font-weight:800; font-size:16px;">❤️ 배달 성공! ❤️</span>`;
    
    const orderTextEl = custEl.querySelector('.order-text');
    orderTextEl.innerHTML = `냠냠! 정말 맛있다! 고마워! 😋`;

    try { triggerConfetti(); } catch(err){}
    
    checkAllG2Deliveries();

  } else {
    try { playFailSound(); } catch(err){}
    goblinEl.className = `g2-goblin-char ${order.goblinClass} sad`;
    if (mouth) mouth.setAttribute('d', 'M 42 66 Q 50 58 58 66');

    shakeElement(inputBox);

    let errorMsg = "도깨비가 시무룩해요. 떡 배달을 다시 해볼까요?\n";
    if (!isRicecakeCorrect) {
      errorMsg += "💡 접시에 담은 떡 조각의 크기나 개수가 주문서와 달라요.";
    } else if (!isInputCorrect) {
      errorMsg += "💡 떡은 접시에 잘 담았는데, 적은 분수(분모, 분자)가 실제 떡과 다른 것 같아요.";
    }
    alert(errorMsg);

    setTimeout(() => {
      goblinEl.className = `g2-goblin-char ${order.goblinClass}`;
      if (mouth) mouth.setAttribute('d', 'M 45 62 Q 50 67 55 62');
    }, 2000);
  }
}

// 모든 세 도깨비 주문 성공여부 체크
function checkAllG2Deliveries() {
  if (typeof g3State !== 'undefined') { // 전역 상태 접근 방어
    if (g2State.completed.A && g2State.completed.B && g2State.completed.C) {
      setTimeout(() => {
        addCoins(10);
      }, 1000);
    }
  }
}

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
initGame2();
