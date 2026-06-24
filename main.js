// ==========================================
// 전역 게임 매니저 & 상태 관리
// ==========================================

const gameState = {
  coins: 10, // 초기 코인 10개 지급!
  soundEnabled: true,
  currentTab: 'game1',
  audioCtx: null
};

// DOM 요소
const totalCoinsEl = document.getElementById('total-coins');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const navTabs = document.querySelectorAll('.nav-tab');
const gameSections = document.querySelectorAll('.game-section');

const rewardModal = document.getElementById('reward-modal');
const modalNextBtn = document.getElementById('modal-next-btn');
const particleCanvas = document.getElementById('particle-canvas');
const particleCtx = particleCanvas.getContext('2d');

// 파티클 시스템용 변수
let particles = [];
let animationFrameId = null;

// ==========================================
// 초기화 작업
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 코인 불러오기
  const savedCoins = localStorage.getItem('dokkaebi_coins');
  if (savedCoins !== null) {
    gameState.coins = parseInt(savedCoins, 10);
  } else {
    gameState.coins = 10; // 첫 구동 시 10코인 제공
  }
  updateCoinDisplay();

  // 탭 네비게이션 이벤트 바인딩
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playClickSound();
      const targetGame = tab.getAttribute('data-game');
      switchTab(targetGame);
    });
  });

  // 사운드 토글 이벤트
  soundToggleBtn.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggleBtn.innerHTML = gameState.soundEnabled ? '🔊 소리 켬' : '🔇 소리 끔';
    soundToggleBtn.classList.toggle('disabled', !gameState.soundEnabled);
    initAudioContext();
    playClickSound();
  });

  // 리워드 모달 이벤트
  modalNextBtn.addEventListener('click', () => {
    playClickSound();
    closeRewardModal();
    // 현재 활성화된 게임의 다음 문제 출제
    if (gameState.currentTab === 'game1') {
      if (typeof initGame1 === 'function') initGame1();
    } else if (gameState.currentTab === 'game2') {
      if (typeof initGame2 === 'function') initGame2();
    } else if (gameState.currentTab === 'game3') {
      if (typeof initGame3 === 'function') initGame3();
    }
  });

  // 화면 크기 조정에 따른 파티클 캔버스 조절
  window.addEventListener('resize', resizeParticleCanvas);
  resizeParticleCanvas();

  // 첫 클릭 시 오디오 콘텍스트 활성화 유도
  document.body.addEventListener('click', () => {
    initAudioContext();
  }, { once: true });

  // 터치 기반 드래그 앤 드롭 폴리필/에뮬레이터 초기화
  initTouchDragAndDrop();
});

// ==========================================
// 오디오 시스템 (Web Audio API - 예외 처리 강화)
// ==========================================
function initAudioContext() {
  if (!gameState.soundEnabled) return;
  try {
    if (!gameState.audioCtx) {
      gameState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (gameState.audioCtx && gameState.audioCtx.state === 'suspended') {
      gameState.audioCtx.resume();
    }
  } catch (error) {
    console.warn("오디오 콘텍스트를 초기화할 수 없습니다. 무음 모드로 전환됩니다.", error);
    gameState.soundEnabled = false;
  }
}

// 1. 클릭음 (뿅!)
function playClickSound() {
  if (!gameState.soundEnabled) return;
  try {
    initAudioContext();
    const ctx = gameState.audioCtx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (err) {
    console.warn("사운드 재생 실패:", err);
  }
}

// 2. 드롭음 (쏙!)
function playDropSound() {
  if (!gameState.soundEnabled) return;
  try {
    initAudioContext();
    const ctx = gameState.audioCtx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.quadraticRampToValueAtTime(800, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    console.warn("사운드 재생 실패:", err);
  }
}

// 3. 성공음 (실로폰 딩동댕)
function playSuccessSound() {
  if (!gameState.soundEnabled) return;
  try {
    initAudioContext();
    const ctx = gameState.audioCtx;
    if (!ctx) return;
    
    const playNote = (freq, time, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      osc.start(time);
      osc.stop(time + duration);
    };
    
    const now = ctx.currentTime;
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.1, 0.15); // E5
    playNote(783.99, now + 0.2, 0.15); // G5
    playNote(1046.50, now + 0.35, 0.3); // C6
  } catch (err) {
    console.warn("사운드 재생 실패:", err);
  }
}

// 4. 실패음 (쿵...)
function playFailSound() {
  if (!gameState.soundEnabled) return;
  try {
    initAudioContext();
    const ctx = gameState.audioCtx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (err) {
    console.warn("사운드 재생 실패:", err);
  }
}

// 5. 코인 찰랑음
function playCoinSound() {
  if (!gameState.soundEnabled) return;
  try {
    initAudioContext();
    const ctx = gameState.audioCtx;
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const playClink = (time, pitch) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, time);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
      osc.start(time);
      osc.stop(time + 0.08);
    };

    playClink(now, 1500);
    playClink(now + 0.05, 1800);
    playClink(now + 0.1, 2100);
  } catch (err) {
    console.warn("사운드 재생 실패:", err);
  }
}

// ==========================================
// 코인 보상 및 힌트 연동
// ==========================================
function updateCoinDisplay() {
  totalCoinsEl.innerText = gameState.coins;
  localStorage.setItem('dokkaebi_coins', gameState.coins);
}

// 모달을 띄우며 코인 지급 (최종 완료용)
function addCoins(amount) {
  gameState.coins += amount;
  updateCoinDisplay();
  playCoinSound();
  showRewardModal(amount);
  triggerConfetti();
}

// 모달을 띄우지 않고 코인 즉시 지급 (개별 완료용)
function addCoinsDirect(amount) {
  gameState.coins += amount;
  updateCoinDisplay();
  playCoinSound();
  triggerConfetti();
}

function deductCoins(amount) {
  if (gameState.coins >= amount) {
    gameState.coins -= amount;
    updateCoinDisplay();
    playClickSound();
    return true;
  } else {
    alert("🪙 앗! 코인이 조금 모자라요! 떡을 배달해서 코인을 더 모아보세요!");
    return false;
  }
}

// ==========================================
// 탭 전환 시스템
// ==========================================
function switchTab(tabId) {
  gameState.currentTab = tabId;
  
  navTabs.forEach(tab => {
    if (tab.getAttribute('data-game') === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  gameSections.forEach(section => {
    if (section.id === `${tabId}-container`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  if (tabId === 'game1' && typeof initGame1 === 'function') {
    initGame1();
  } else if (tabId === 'game2' && typeof initGame2 === 'function') {
    initGame2();
  } else if (tabId === 'game3' && typeof initGame3 === 'function') {
    initGame3();
  }
}

// ==========================================
// 리워드 축하 모달
// ==========================================
function showRewardModal(earnedAmount) {
  const msg = rewardModal.querySelector('.modal-message');
  const reward = rewardModal.querySelector('.earned-coin-anim');
  
  const messages = [
    "맛있는 떡을 배달하고 도깨비를 행복하게 했어!",
    "우와! 정답이야! 도깨비가 기뻐하며 춤을 춰요!",
    "대단해! 분수 박사님이 나타났다!",
    "도깨비가 배부르게 떡을 먹었어요! 고마워!"
  ];
  
  msg.innerText = messages[Math.floor(Math.random() * messages.length)];
  reward.innerText = `🪙 +${earnedAmount}`;
  rewardModal.classList.remove('hidden');
}

function closeRewardModal() {
  rewardModal.classList.add('hidden');
}

// ==========================================
// 코인/별 파티클 시스템 (Canvas 애니메이션)
// ==========================================
function resizeParticleCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 15 + 10;
    this.speedX = Math.random() * 12 - 6;
    this.speedY = Math.random() * -15 - 5;
    this.gravity = 0.4;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.type = Math.random() > 0.5 ? 'coin' : 'star';
    this.opacity = 1;
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
  }

  update() {
    this.x += this.speedX;
    this.speedY += this.gravity;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    this.opacity -= 0.015;
  }

  draw() {
    particleCtx.save();
    particleCtx.globalAlpha = this.opacity;
    particleCtx.translate(this.x, this.y);
    particleCtx.rotate((this.rotation * Math.PI) / 180);

    if (this.type === 'coin') {
      particleCtx.beginPath();
      particleCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      particleCtx.fillStyle = '#FFD700';
      particleCtx.strokeStyle = '#DAA520';
      particleCtx.lineWidth = 2;
      particleCtx.fill();
      particleCtx.stroke();

      particleCtx.beginPath();
      particleCtx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
      particleCtx.strokeStyle = '#DAA520';
      particleCtx.stroke();
    } else {
      particleCtx.beginPath();
      for (let i = 0; i < 5; i++) {
        particleCtx.lineTo(
          Math.cos(((18 + i * 72) * Math.PI) / 180) * (this.size / 2),
          Math.sin(((18 + i * 72) * Math.PI) / 180) * (this.size / 2)
        );
        particleCtx.lineTo(
          Math.cos(((54 + i * 72) * Math.PI) / 180) * (this.size / 4),
          Math.sin(((54 + i * 72) * Math.PI) / 180) * (this.size / 4)
        );
      }
      particleCtx.closePath();
      particleCtx.fillStyle = this.color;
      particleCtx.fill();
    }
    
    particleCtx.restore();
  }
}

function triggerConfetti() {
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.7;
  
  for (let i = 0; i < 60; i++) {
    particles.push(new Particle(startX, startY));
  }

  if (animationFrameId === null) {
    animateParticles();
  }
}

function animateParticles() {
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  
  particles.forEach((p, idx) => {
    p.update();
    p.draw();
    if (p.y > window.innerHeight || p.opacity <= 0) {
      particles.splice(idx, 1);
    }
  });

  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    animationFrameId = null;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  }
}

// ==========================================
// 터치 드래그 앤 드롭 폴리필 (부등호 카드 지원)
// ==========================================
function initTouchDragAndDrop() {
  let activeTouchElement = null;
  let touchDragData = null;
  let touchClone = null;

  document.addEventListener('touchstart', (e) => {
    const draggable = e.target.closest('[draggable="true"]');
    if (!draggable) return;

    activeTouchElement = draggable;
    
    // 드래그 데이터 수집
    if (draggable.classList.contains('draggable-ricecake')) {
      const denom = draggable.getAttribute('data-denom');
      const num = draggable.getAttribute('data-num');
      touchDragData = { type: 'ricecake', denom: parseInt(denom, 10), num: parseInt(num, 10) };
    } else if (draggable.classList.contains('g3-ricecake-card')) {
      const denom = draggable.getAttribute('data-denom');
      const num = draggable.getAttribute('data-num');
      touchDragData = { type: 'card', denom: parseInt(denom, 10), num: parseInt(num, 10) };
    } else if (draggable.classList.contains('g3-op-card')) {
      // 게임 3 드래그 가능한 부등호 카드
      const op = draggable.getAttribute('data-op');
      touchDragData = { type: 'operator', op: op };
    }

    const touch = e.touches[0];
    touchClone = draggable.cloneNode(true);
    touchClone.id = 'touch-drag-clone';
    touchClone.style.position = 'fixed';
    touchClone.style.left = (touch.clientX - 32) + 'px';
    touchClone.style.top = (touch.clientY - 32) + 'px';
    touchClone.style.width = draggable.offsetWidth + 'px';
    touchClone.style.height = draggable.offsetHeight + 'px';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.zIndex = '9999';
    touchClone.style.opacity = '0.7';
    document.body.appendChild(touchClone);
    
    draggable.classList.add('dragging');
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!activeTouchElement) return;
    e.preventDefault();

    const touch = e.touches[0];
    if (touchClone) {
      touchClone.style.left = (touch.clientX - 32) + 'px';
      touchClone.style.top = (touch.clientY - 32) + 'px';
    }

    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementAtPoint) return;

    const dropzone = elementAtPoint.closest('.plate-zone, .scale-plate, .scale-operator-dropzone');
    
    document.querySelectorAll('.plate-zone, .scale-plate, .scale-operator-dropzone').forEach(dz => dz.classList.remove('dragover'));
    
    if (dropzone) {
      dropzone.classList.add('dragover');
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    if (!activeTouchElement) return;

    if (touchClone) {
      touchClone.remove();
      touchClone = null;
    }

    activeTouchElement.classList.remove('dragging');

    const touch = e.changedTouches[0];
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    
    document.querySelectorAll('.plate-zone, .scale-plate, .scale-operator-dropzone').forEach(dz => dz.classList.remove('dragover'));

    if (elementAtPoint) {
      const dropzone = elementAtPoint.closest('.plate-zone, .scale-plate, .scale-operator-dropzone');
      if (dropzone && touchDragData) {
        const customDropEvent = new CustomEvent('customdrop', {
          detail: {
            data: touchDragData,
            target: dropzone
          }
        });
        dropzone.dispatchEvent(customDropEvent);
      }
    }

    activeTouchElement = null;
    touchDragData = null;
  });
}
