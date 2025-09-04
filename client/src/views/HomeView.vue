<template>
  <div class="home" @mousemove="updateMousePosition" @click="createExplosion">
    <!-- Background particles -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- Multiple Kiro Ghosts floating around -->
    <div class="kiro-ghost main-ghost" :style="mainGhostStyle">
      <img src="/src/assets/kiro-ghost/south.png" alt="Kiro Ghost" class="ghost-image" />
      <div class="ghost-glow"></div>
    </div>

    <div class="kiro-ghost side-ghost-1">
      <img src="/src/assets/kiro-ghost/east.png" alt="Kiro Ghost" class="ghost-image" />
      <div class="ghost-glow"></div>
    </div>

    <div class="kiro-ghost side-ghost-2">
      <img src="/src/assets/kiro-ghost/northeast.png" alt="Kiro Ghost" class="ghost-image" />
      <div class="ghost-glow"></div>
    </div>

    <div class="kiro-ghost side-ghost-3">
      <img src="/src/assets/kiro-ghost/southwest.png" alt="Kiro Ghost" class="ghost-image" />
      <div class="ghost-glow"></div>
    </div>

    <!-- Explosion particles -->
    <div v-for="explosion in explosions" :key="explosion.id" class="explosion" :style="explosion.style">
      <div v-for="i in 12" :key="i" class="explosion-particle" :style="getExplosionParticleStyle(i)"></div>
    </div>

    <!-- Main content -->
    <div class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="neon-title">
            <span v-for="(char, index) in titleChars" :key="index" 
                  :style="{ animationDelay: index * 0.1 + 's' }" 
                  class="char">{{ char }}</span>
          </h1>
          <router-link to="/play" class="neon-button" @click="playClickSound">
            <span class="button-text">👻 ENTER THE SPIRIT REALM 🌟</span>
            <div class="button-glow"></div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #1a0033 0%, #000000 70%);
  color: white;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
  position: relative;
}

/* Kiro Ghost */
.kiro-ghost {
  position: fixed;
  width: 120px;
  height: 120px;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.main-ghost {
  animation: float 4s ease-in-out infinite;
}

.side-ghost-1 {
  top: 15%;
  right: 15%;
  animation: float 5s ease-in-out infinite reverse;
  opacity: 0.7;
}

.side-ghost-2 {
  bottom: 20%;
  left: 10%;
  animation: float 6s ease-in-out infinite;
  opacity: 0.6;
}

.side-ghost-3 {
  top: 60%;
  right: 25%;
  animation: float 4.5s ease-in-out infinite reverse;
  opacity: 0.5;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(2deg); }
  50% { transform: translateY(-10px) rotate(0deg); }
  75% { transform: translateY(-25px) rotate(-2deg); }
}

.ghost-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.8));
  animation: ghostGlow 2s ease-in-out infinite alternate;
}

@keyframes ghostGlow {
  0% { 
    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.8));
  }
  100% { 
    filter: drop-shadow(0 0 40px rgba(0, 255, 255, 1)) drop-shadow(0 0 60px rgba(0, 255, 255, 0.6));
  }
}

.ghost-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* Background particles */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #00ffff;
  border-radius: 50%;
  animation: twinkle 2s infinite ease-in-out;
  box-shadow: 0 0 10px #00ffff;
}

/* Particles will be positioned dynamically via JavaScript */

@keyframes twinkle {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(1); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.5); 
  }
}

/* Hero section */
.hero {
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 5;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-text {
  text-align: center;
}

/* Neon title */
.neon-title {
  font-size: 4rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: #00ffff;
  text-shadow: 
    0 0 10px #00ffff,
    0 0 20px #00ffff,
    0 0 30px #00ffff,
    0 0 40px #00ffff;
  font-family: 'Courier New', monospace;
}

.char {
  display: inline-block;
  animation: neonFlicker 2s ease-in-out infinite;
}

@keyframes neonFlicker {
  0%, 100% { 
    opacity: 1;
    text-shadow: 
      0 0 10px #00ffff,
      0 0 20px #00ffff,
      0 0 30px #00ffff,
      0 0 40px #00ffff;
    transform: translateY(0px);
  }
  50% { 
    opacity: 0.8;
    text-shadow: 
      0 0 5px #00ffff,
      0 0 10px #00ffff,
      0 0 15px #00ffff,
      0 0 20px #00ffff;
    transform: translateY(-2px);
  }
}

/* Explosion effects */
.explosion {
  position: fixed;
  pointer-events: none;
  z-index: 20;
}

.explosion-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ff00ff;
  border-radius: 50%;
  animation: explode 0.8s ease-out forwards;
  box-shadow: 0 0 12px #ff00ff;
}

@keyframes explode {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: scale(0) translate(var(--dx), var(--dy));
    opacity: 0;
  }
}

/* Neon button */
.neon-button {
  position: relative;
  display: inline-block;
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 500;
  text-decoration: none;
  color: #00ffff;
  background: transparent;
  border: 2px solid #00ffff;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  overflow: hidden;
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.4),
    inset 0 0 15px rgba(0, 255, 255, 0.1);
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.neon-button:hover {
  color: #000;
  background: #00ffff;
  box-shadow: 
    0 0 25px #00ffff,
    0 0 35px #00ffff,
    0 0 45px #00ffff;
  transform: translateY(-3px) scale(1.05);
}

.neon-button:hover .button-glow {
  left: 100%;
}

.neon-button:active {
  transform: translateY(-1px) scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .neon-title {
    font-size: 2.5rem;
  }

  .neon-button {
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
  }

  .kiro-ghost {
    width: 80px;
    height: 100px;
    top: 15%;
    left: 15%;
  }

  .ghost-body {
    width: 60px;
    height: 80px;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// 반응형 데이터
const mouseX = ref(0)
const mouseY = ref(0)
const ghostX = ref(200)
const ghostY = ref(200)
const explosions = ref<Array<{id: number, style: any}>>([])
let explosionId = 0

// 타이틀 문자 배열
const titleChars = computed(() => 'Spirit of Kiro'.split(''))

// 마우스 위치 업데이트
const updateMousePosition = (event: MouseEvent) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  
  // 메인 고스트가 마우스를 부드럽게 따라다니도록
  const targetX = event.clientX - 60
  const targetY = event.clientY - 60
  
  ghostX.value += (targetX - ghostX.value) * 0.08
  ghostY.value += (targetY - ghostY.value) * 0.08
}

// 메인 고스트 스타일 계산
const mainGhostStyle = computed(() => ({
  left: `${ghostX.value}px`,
  top: `${ghostY.value}px`,
}))

// 배경 파티클 스타일 (동적 생성)
const getParticleStyle = (index: number) => {
  const x = Math.random() * 100
  const y = Math.random() * 100
  const delay = Math.random() * 3
  const size = 2 + Math.random() * 2
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`
  }
}

// 폭발 효과 생성
const createExplosion = (event: MouseEvent) => {
  const newExplosion = {
    id: explosionId++,
    style: {
      left: `${event.clientX}px`,
      top: `${event.clientY}px`,
    }
  }
  
  explosions.value.push(newExplosion)
  
  // 0.8초 후 폭발 제거
  setTimeout(() => {
    const index = explosions.value.findIndex(exp => exp.id === newExplosion.id)
    if (index > -1) {
      explosions.value.splice(index, 1)
    }
  }, 800)
}

// 폭발 파티클 스타일
const getExplosionParticleStyle = (index: number) => {
  const angle = (index / 12) * Math.PI * 2
  const distance = 60 + Math.random() * 40
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance
  
  return {
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    animationDelay: `${Math.random() * 0.2}s`
  }
}

// 클릭 사운드
const playClickSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
  } catch (e) {
    console.log('Audio not supported')
  }
}

// 초기 고스트 위치 설정
onMounted(() => {
  ghostX.value = window.innerWidth / 2 - 60
  ghostY.value = window.innerHeight / 2 - 60
  console.log('🎭 Kiro Ghost Landing Page Loaded! Welcome to the Spirit Realm! 👻✨')
})
</script>