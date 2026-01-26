# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mr. Taps is a vanilla JavaScript PWA metronome application using the Web Audio API. It has zero runtime dependencies - all audio synthesis and scheduling is done with native browser APIs.

## Commands

```bash
npm test              # Run Jest test suite (47 tests)
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

**Compound time signatures:**
Optional `secondaryBeatsPerMeasure` allows alternating between two beat patterns (e.g., 3+4 for 7/4). The `currentMeasure` property tracks which pattern is active (0=primary, 1=secondary).

**State persistence:**
All settings (BPM, beats per measure, secondary beats, subdivision, sound parameters) automatically save to localStorage and restore on load.

## Testing

Tests are in `tests/metronome.test.js` with Web Audio API mocks defined in `tests/setup.js`. The mock implements AudioContext, OscillatorNode, and GainNode with all methods used by the Metronome class.

Run a specific test:
```bash
npm test -- --testNamePattern="pattern"
```

## Key Constraints

- BPM range: 1-300 (validated in `setTempo`)
- Beats per measure: 1-20 (validated in `setBeatsPerMeasure`)
- Secondary beats: null (disabled) or 1-20 (validated in `setSecondaryBeatsPerMeasure`)
- Subdivision options: none, 8ths, 16ths, triplets
- Waveform options: sine, square, triangle, sawtooth
