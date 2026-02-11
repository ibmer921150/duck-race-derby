import { Howl } from 'howler';

type ThemeType = 'duck' | 'horse' | 'car' | 'marble';

/**
 * AudioManager - Singleton class to manage game audio
 * Handles background music and sound effects efficiently
 */
class AudioManager {
  private static instance: AudioManager | null = null;
  
  // Background music Howl instances
  private backgroundMusic: Map<ThemeType, Howl> = new Map();
  
  // Sound effects Howl instances
  private sfxSounds: Map<string, Howl> = new Map();
  
  // Currently playing background music
  private currentBgMusic: Howl | null = null;
  private currentTheme: ThemeType | null = null;
  
  private constructor() {
    this.initializeAudio();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  /**
   * Initialize all audio assets
   */
  private initializeAudio(): void {
    // Get base URL for assets (handles GitHub Pages deployment)
    const baseUrl = import.meta.env.BASE_URL || '/';
    
    // Initialize background music for each theme
    const themes: ThemeType[] = ['duck', 'horse', 'car', 'marble'];
    
    themes.forEach(theme => {
      this.backgroundMusic.set(theme, new Howl({
        src: [`${baseUrl}audio/music/${theme}.mp3`, `${baseUrl}audio/music/${theme}.ogg`],
        loop: true,
        volume: 0.5,
        preload: true, // Preload for immediate playback
        onloaderror: (id, error) => {
          console.error(`❌ Failed to load ${theme} music:`, error);
        },
        onload: () => {
          console.log(`✅ Loaded ${theme} music successfully`);
        }
      }));
    });
    
    // Initialize sound effects
    this.sfxSounds.set('start', new Howl({
      src: [`${baseUrl}audio/sfx/start.mp3`, `${baseUrl}audio/sfx/start.ogg`],
      volume: 0.7,
      preload: true,
      onloaderror: (id, error) => {
        console.error('❌ Failed to load start SFX:', error);
      },
      onload: () => {
        console.log('✅ Loaded start SFX successfully');
      }
    }));
    
    this.sfxSounds.set('winner', new Howl({
      src: [`${baseUrl}audio/sfx/winner.mp3`, `${baseUrl}audio/sfx/winner.ogg`],
      volume: 0.8,
      preload: true,
      onloaderror: (id, error) => {
        console.error('❌ Failed to load winner SFX:', error);
      },
      onload: () => {
        console.log('✅ Loaded winner SFX successfully');
      }
    }));
  }
  
  /**
   * Play background music for a specific theme
   * @param theme - The race theme (duck, horse, car, marble)
   */
  public playBackgroundMusic(theme: ThemeType): void {
    // Stop current music if playing
    this.stopBackgroundMusic();
    
    const music = this.backgroundMusic.get(theme);
    if (music) {
      this.currentBgMusic = music;
      this.currentTheme = theme;
      
      // Fade in the music
      music.fade(0, 0.5, 1000);
      music.play();
      
      console.log(`🎵 Playing ${theme} background music`);
    } else {
      console.warn(`Background music for theme "${theme}" not found`);
    }
  }
  
  /**
   * Stop background music with fade out
   */
  public stopBackgroundMusic(): void {
    if (this.currentBgMusic && this.currentBgMusic.playing()) {
      // Fade out then stop
      this.currentBgMusic.fade(this.currentBgMusic.volume(), 0, 500);
      
      setTimeout(() => {
        if (this.currentBgMusic) {
          this.currentBgMusic.stop();
          console.log('🎵 Stopped background music');
        }
      }, 500);
      
      this.currentBgMusic = null;
      this.currentTheme = null;
    }
  }
  
  /**
   * Play the race start sound effect
   */
  public playStartSound(): void {
    const startSfx = this.sfxSounds.get('start');
    if (startSfx) {
      startSfx.play();
      console.log('🔊 Playing start sound');
    }
  }
  
  /**
   * Play the winner sound effect
   */
  public playWinnerSound(): void {
    const winnerSfx = this.sfxSounds.get('winner');
    if (winnerSfx) {
      winnerSfx.play();
      console.log('🔊 Playing winner sound');
    }
  }
  
  /**
   * Set master volume for all sounds (0-1)
   */
  public setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(clampedVolume);
  }
  
  /**
   * Mute/unmute all audio
   */
  public setMuted(muted: boolean): void {
    Howler.mute(muted);
  }
  
  /**
   * Stop all audio and clean up
   */
  public stopAll(): void {
    this.stopBackgroundMusic();
    this.sfxSounds.forEach(sfx => sfx.stop());
  }
  
  /**
   * Preload a specific theme's music
   * Useful for loading music before the race starts
   */
  public preloadThemeMusic(theme: ThemeType): void {
    const music = this.backgroundMusic.get(theme);
    if (music && music.state() === 'unloaded') {
      music.load();
      console.log(`📦 Preloading ${theme} music`);
    }
  }
  
  /**
   * Check if background music is currently playing
   */
  public isPlayingMusic(): boolean {
    return this.currentBgMusic !== null && this.currentBgMusic.playing();
  }
  
  /**
   * Get current theme
   */
  public getCurrentTheme(): ThemeType | null {
    return this.currentTheme;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
export type { ThemeType };
