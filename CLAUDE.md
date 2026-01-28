# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mr. Taps is a vanilla JavaScript PWA metronome application using the Web Audio API. It has zero runtime dependencies - all audio synthesis and scheduling is done with native browser APIs.

## Commands

```bash
npm test              # Run Jest test suite (104 tests) with coverage report
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
- Percussive envelope: 5ms attack, configurable decay with exponential gain ramping
- Default frequencies: 440Hz accent, 880Hz regular, 660Hz subdivision
- Unified `volumes` object with `setVolume(type, value)` method for all volume types
- Volume types: 'beat' (main beat, default 1.0), 'eighth', 'sixteenth', 'triplet' (subdivisions, default 0)
- All subdivision types can play simultaneously at different volumes

**Compound time signatures:**
Optional `secondaryBeatsPerMeasure` allows alternating between two beat patterns (e.g., 3+4 for 7/4). The `currentMeasure` property tracks which pattern is active (0=primary, 1=secondary).

**Color themes:**
Three themes available via `data-theme` attribute on `<html>`: default (dark blue), black (green accents), light (white background). Theme stored in localStorage with other settings.

**State persistence:**
All settings (BPM, beats per measure, secondary beats, subdivision volumes, sound parameters, theme) automatically save to localStorage and restore on load.

## Testing

Tests are in `tests/metronome.test.js` (core audio logic) and `tests/app.test.js` (UI layer) with Web Audio API mocks defined in `tests/setup.js`. The mock implements AudioContext, OscillatorNode, and GainNode with all methods used by the Metronome class.

Coverage: 83.92% branches for app.js, 93.54% branches for metronome.js. HTML coverage report generated in `coverage/` directory.

Run a specific test:
```bash
npm test -- --testNamePattern="pattern"
```

## Key Constraints

- BPM range: 1-300 (validated in `setTempo`)
- Beats per measure: 1-20 (validated in `setBeatsPerMeasure`)
- Secondary beats: null (disabled) or 1-20 (validated in `setSecondaryBeatsPerMeasure`)
- Volumes: 0-1 for each type (beat, eighth, sixteenth, triplet), clamped in `setVolume`
- Waveform options: sine, square, triangle, sawtooth
- Theme options: default, black, light
