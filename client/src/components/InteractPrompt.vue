<template>
  <div 
    v-if="show" 
    class="interact-prompt"
    :class="variant"
    :style="computedStyle"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

interface Props {
  show: boolean
  text?: string
  variant?: 'default' | 'compact' | 'large'
  position?: 'top' | 'top-right' | 'center'
  offsetTop?: number | string
  offsetLeft?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'E',
  variant: 'default',
  position: 'top',
  offsetTop: undefined,
  offsetLeft: undefined
})

const gameStore = useGameStore()
const tileSize = computed(() => gameStore.tileSize)

const computedStyle = computed(() => {
  const style: Record<string, string> = {}
  
  // Position-based styles
  switch (props.position) {
    case 'top':
      style.top = props.offsetTop !== undefined 
        ? (typeof props.offsetTop === 'number' ? `${props.offsetTop}px` : props.offsetTop)
        : `calc(-1.1 * ${tileSize.value}px)`
      style.left = props.offsetLeft !== undefined
        ? (typeof props.offsetLeft === 'number' ? `${props.offsetLeft}px` : props.offsetLeft)
        : '50%'
      style.transform = 'translateX(-50%)'
      break
    case 'top-right':
      style.top = props.offsetTop !== undefined 
        ? (typeof props.offsetTop === 'number' ? `${props.offsetTop}px` : props.offsetTop)
        : '-80%'
      style.right = props.offsetLeft !== undefined
        ? (typeof props.offsetLeft === 'number' ? `${props.offsetLeft}px` : props.offsetLeft)
        : '-10%'
      break
    case 'center':
      style.top = '50%'
      style.left = '50%'
      style.transform = 'translate(-50%, -50%)'
      break
  }
  
  return style
})
</script>

<style scoped>
.interact-prompt {
  position: absolute;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 5px white;
  background-color: black;
  border-radius: calc(0.08 * v-bind(tileSize) * 1px);
  z-index: 10;
  line-height: 1;
  animation: pulse 1s infinite;
  pointer-events: none;
}

.interact-prompt.default {
  font-size: calc(0.5 * v-bind(tileSize) * 1px);
  padding: calc(0.1 * v-bind(tileSize) * 1px) calc(0.15 * v-bind(tileSize) * 1px);
}

.interact-prompt.compact {
  font-size: calc(0.4 * v-bind(tileSize) * 1px);
  padding: calc(0.08 * v-bind(tileSize) * 1px) calc(0.12 * v-bind(tileSize) * 1px);
}

.interact-prompt.large {
  font-size: calc(0.6 * v-bind(tileSize) * 1px);
  padding: calc(0.12 * v-bind(tileSize) * 1px) calc(0.18 * v-bind(tileSize) * 1px);
}

@keyframes pulse {
  0% { 
    text-shadow: 0 0 5px white;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  }
  50% { 
    text-shadow: 0 0 10px white;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  }
  100% { 
    text-shadow: 0 0 5px white;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  }
}
</style>