import { type Ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { SocketSystem } from './socket-system'
import type { Item } from './item-system'
import { staticAssets } from '../assets'

export interface PreloadProgress {
  total: number
  loaded: number
  failed: number
  pending: number
}

// List of static assets to preload
const STATIC_ASSETS = Object.values(staticAssets)

export class PreloaderSystem {
  private socketSystem: SocketSystem
  private eventListenerIds: string[] = []
  private loadingQueue: Set<string> = new Set()
  private loadedImages: Set<string> = new Set()
  private failedImages: Set<string> = new Set()
  private progress: Ref<PreloadProgress>
  private isInitialLoadComplete: Ref<boolean>

  constructor(socketSystem: SocketSystem, progress: Ref<PreloadProgress>, isInitialLoadComplete: Ref<boolean>) {
    this.socketSystem = socketSystem
    this.progress = progress
    this.isInitialLoadComplete = isInitialLoadComplete
    
    // Subscribe to the same events as ItemSystem to preload item images
    this.eventListenerIds.push(this.socketSystem.addEventListener('inventory-items:*', this.handleInventoryItems.bind(this)))
    this.eventListenerIds.push(this.socketSystem.addEventListener('pulled-item', this.handlePulledItem.bind(this)))
    this.eventListenerIds.push(this.socketSystem.addEventListener('skill-results', this.handleSkillResults.bind(this)))
    this.eventListenerIds.push(this.socketSystem.addEventListener('discarded-results', this.handleDiscardedResults.bind(this)))

    // Automatically start loading static assets
    this.preloadStaticAssets(STATIC_ASSETS).catch(error => {
      console.error('[PreloaderSystem] Failed to load static assets:', error)
    })
  }

  /**
   * Preloads a single image and updates progress
   */
  private async preloadImage(url: string): Promise<void> {
    if (this.loadedImages.has(url) || this.failedImages.has(url) || this.loadingQueue.has(url)) {
      return
    }

    this.loadingQueue.add(url)
    this.updateProgress()

    try {
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })
      this.loadedImages.add(url)
    } catch (error) {
      console.error(`[PreloaderSystem] Failed to load image: ${url}`, error)
      this.failedImages.add(url)
    } finally {
      this.loadingQueue.delete(url)
      this.updateProgress()
    }
  }

  /**
   * Updates the progress state
   */
  private updateProgress() {
    const newProgress = {
      total: this.loadedImages.size + this.failedImages.size + this.loadingQueue.size,
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
      pending: this.loadingQueue.size
    }
    this.progress.value = newProgress
    
    // Log progress update
    /*console.log('[PreloaderSystem] Progress Update:', {
      total: newProgress.total,
      loaded: newProgress.loaded,
      failed: newProgress.failed,
      pending: newProgress.pending,
      percentComplete: newProgress.total > 0 
        ? Math.round((newProgress.loaded / newProgress.total) * 100) 
        : 0
    })*/
  }

  /**
   * Preloads all static game assets
   */
  async preloadStaticAssets(staticAssets: string[]): Promise<void> {
    const promises = staticAssets.map(url => this.preloadImage(url))
    await Promise.all(promises)
    this.isInitialLoadComplete.value = true
  }

  /**
   * Preloads images from an array of items
   */
  private async preloadItemImages(items: Item[]): Promise<void> {
    const imageUrls = items
      .map(item => item.imageUrl)
      .filter(url => url && !this.loadedImages.has(url) && !this.failedImages.has(url))
    
    if (imageUrls.length > 0) {
      await Promise.all(imageUrls.map(url => this.preloadImage(url)))
    }
  }

  private handleInventoryItems(data?: any) {
    if (Array.isArray(data)) {
      this.preloadItemImages(data)
    }
  }

  private handlePulledItem(data?: any) {
    if (data?.item) {
      this.preloadItemImages([data.item])
    }
  }

  private handleSkillResults(data?: any) {
    const items: Item[] = []
    if (data.tool) items.push(data.tool)
    if (data.outputItems) items.push(...data.outputItems)
    if (items.length > 0) {
      this.preloadItemImages(items)
    }
  }

  private handleDiscardedResults(data?: any) {
    if (Array.isArray(data)) {
      this.preloadItemImages(data)
    }
  }

  cleanup() {
    this.eventListenerIds.forEach(id => {
      this.socketSystem.removeEventListener('discarded-results', id)
    })
    this.eventListenerIds = []
  }
} 