# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mr. Taps is a vanilla JavaScript PWA metronome application using the Web Audio API. It has zero runtime dependencies - all audio synthesis and scheduling is done with native browser APIs.

## Commands

```bash
npm test              # Run Jest test suite (142 tests) with coverage report
npm start             # Serve public/ directory at http://localhost:3000
npm run generate-icons # Regenerate PWA icons (requires Canvas library)
```

No lint or build commands - source files are served directly.

## Architecture

**Core separation:**
- `public/js/metronome.js` - Metronome class with all audio logic (Web Audio API scheduling, oscillator synthesis, percussive envelope generation)
- `public/js/app.js` - UI layer handling DOM events, beat indicators, settings dialog, and localStorage persistence (key: `'mr-taps-settings'`)
- `public/sw.js` - Service worker for offline caching (cache version: v3)

**Audio synthesis details:**
- Uses look-ahead scheduling pattern (`scheduleNote`/`scheduler` methods) to prevent timing glitches
- Three beat types with independent sound settings: accent (first beat), regular, subdivision
- Full ADSR envelope: attack (default 5ms), decay (default 40ms), sustain (default 50%), release (default 40ms)
- White noise synthesis via `createNoiseBuffer()` for percussive sounds (controlled by `noise` parameter 0-1)
- Default frequencies: 440Hz accent, 880Hz regular, 660Hz subdivision (range: 100-12000 Hz)
- Unified `volumes` object with `setVolume(type, value)` method for all volume types
- Volume types: 'beat' (main beat, default 1.0), 'eighth', 'sixteenth', 'triplet' (subdivisions, default 0)
- All subdivision types can play simultaneously at different volumes

**Sound presets:**
Five built-in presets available via `SOUND_PRESETS` constant and `applySoundPreset(name)` method:
- `default`: Warm sine wave tones
- `click`: Sharp square wave with short envelope (traditional metronome)
- `clave`: Triangle wave with longer decay (woody percussion)
- `beep`: Sine wave with high sustain (electronic)
- `hihat`: High-frequency square wave + 90% white noise (metallic percussion)

**Compound time signatures:**
Optional `secondaryBeatsPerMeasure` allows alternating between two beat patterns (e.g., 3+4 for 7/4). The `currentMeasure` property tracks which pattern is active (0=primary, 1=secondary).

**Color themes:**
Three themes available via `data-theme` attribute on `<html>`: default (dark blue), black (green accents), light (white background). Theme stored in localStorage with other settings.

**State persistence:**
All settings (BPM, beats per measure, secondary beats, subdivision volumes, sound parameters, theme) automatically save to localStorage and restore on load.

## Testing

Tests are in `tests/metronome.test.js` (core audio logic) and `tests/app.test.js` (UI layer) with Web Audio API mocks defined in `tests/setup.js`. The mock implements AudioContext, OscillatorNode, and GainNode with all methods used by the Metronome class.

Coverage: 78.72% branches for app.js, 89.74% branches for metronome.js. HTML coverage report generated in `coverage/` directory.

Run a specific test:
```bash
npm test -- --testNamePattern="pattern"
```

## Key Constraints

- BPM range: 1-300 (validated in `setTempo`)
- Beats per measure: 1-20 (validated in `setBeatsPerMeasure`)
- Secondary beats: null (disabled) or 1-20 (validated in `setSecondaryBeatsPerMeasure`)
- Volumes: 0-1 for each type (beat, eighth, sixteenth, triplet), clamped in `setVolume`
- Pitch range: 100-12000 Hz
- ADSR envelope ranges: attack 1-100ms, decay 10-500ms, sustain 0-100%, release 1-500ms
- Noise mix: 0-1 (0 = pure oscillator, 1 = pure white noise)
- Waveform options: sine, square, triangle, sawtooth
- Sound preset options: default, click, clave, beep, hihat
- Theme options: default, black, light
