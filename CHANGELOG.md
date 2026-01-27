# Changelog

All notable changes to Mr. Taps will be documented in this file.

## [2026.01.27-1] - 2026-01-27

### Added
- Independent subdivision volume sliders for 8ths (&), 16ths (e, a), and triplets
- All three subdivision types can be layered simultaneously
- Color theme selector in settings: Default, Black (green accents), and Light

### Changed
- Subdivisions now use volume sliders (0-100%) instead of dropdown selector
- Subdivision scheduling now calculates timing per-beat rather than stepping through subdivisions

### Removed
- Single subdivision type selector (replaced by independent volume controls)

## [2026.01.26-1] - 2026-01-26

### Added
- ±5 BPM buttons for faster tempo adjustments
- Compound time signature support with secondary beats (e.g., 7/4 as 3+4)
- Visual separator between primary and secondary beat indicators

### Fixed
- Beat indicators now correctly reset when disabling secondary beats mid-measure

## [2026.01.25-4] - 2026-01-25

### Added
- Settings dialog (gear icon) with configurable sound parameters:
  - Pitch (100-2000 Hz) for each beat type
  - Decay time (10-500 ms) for each beat type
  - Waveform (sine, square, triangle, sawtooth) for each beat type
- localStorage persistence for all settings (tempo, beats, subdivision, sound settings)
- "Reset to Defaults" button in settings dialog
- 10 new tests for sound settings (47 total)

### Changed
- Bumped service worker cache version to v3

## [2026.01.25-3] - 2026-01-25

### Added
- Favicon (32x32) to eliminate browser 404 errors
- Favicon generation added to `scripts/generate-icons.js`

### Changed
- Bumped service worker cache version to v2

## [2026.01.25-2] - 2026-01-25

### Changed
- Added percussive envelope to sounds with 5ms attack and 80ms exponential decay
  for a more staccato feel
- Consolidated duplicate `metronome.js` files - removed `src/` directory
- Tests now import directly from `public/js/metronome.js`

### Fixed
- Updated test mocks to support `exponentialRampToValueAtTime` for envelope testing

## [2026.01.25-1] - 2026-01-25

### Added
- Initial release of Mr. Taps PWA metronome
- Core Metronome class with Web Audio API
- Tempo control: 1-300 BPM
- Time signature: 1-20 beats per measure
- Subdivisions: 8ths, 16ths, and triplets
- 440Hz accented beats, 880Hz regular beats, 660Hz subdivision beats
- PWA support with service worker for offline use
- Installable on mobile and desktop
- Visual beat indicators
- Keyboard control (spacebar to toggle)
- Jest test suite with 37 tests
