# Duck Race Derby Audio Assets

This directory contains audio files for the game.

## Directory Structure

```
audio/
├── music/          # Background music files
│   ├── duck.mp3    # Duck theme music
│   ├── horse.mp3   # Horse theme music
│   ├── car.mp3     # Car theme music
│   └── marble.mp3  # Marble theme music
└── sfx/            # Sound effects
    ├── start.mp3   # Race start sound
    └── winner.mp3  # Winner celebration sound
```

## Audio File Requirements

### Background Music
- **Format**: MP3 (primary), OGG (fallback)
- **Duration**: 30-120 seconds (loops automatically)
- **Volume**: Normalized to avoid clipping
- **Bitrate**: 128-192 kbps recommended
- **Mood**: 
  - Duck: Playful, whimsical
  - Horse: Epic, racing excitement
  - Car: Fast-paced, energetic
  - Marble: Modern, ambient

### Sound Effects
- **Format**: MP3 (primary), OGG (fallback)
- **Duration**: 0.5-3 seconds
- **Volume**: Normalized, impactful
- **Bitrate**: 128 kbps recommended

## Adding Your Own Audio

1. Place your audio files in the appropriate directories
2. Ensure files are named correctly (duck.mp3, horse.mp3, etc.)
3. Optionally provide OGG versions for better browser compatibility
4. Test in the game to ensure proper playback

## Placeholder Audio

Currently, the audio system will gracefully fail if files are not present. To add actual audio:

1. Find or create royalty-free music/SFX
2. Convert to MP3 format (and optionally OGG)
3. Place in the appropriate directory
4. Rebuild and deploy

## Recommended Audio Sources

- **FreeSound.org** - Community sound effects
- **Incompetech.com** - Royalty-free music (Kevin MacLeod)
- **OpenGameArt.org** - Game audio assets
- **YouTube Audio Library** - Free music and sound effects
- **Bensound.com** - Royalty-free music

## License

Ensure any audio files you add comply with their respective licenses and attribution requirements.
