# Changelog

All notable changes to Mr. Taps will be documented in this file.

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
