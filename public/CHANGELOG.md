# Changelog

All notable changes to Mr. Taps will be documented in this file.

## [2026.01.28-4] - 2026-01-28

### Added
- Info button (ⓘ) in header with tabbed dialog showing:
  - Version information
  - MIT license text
  - Changelog history (now loaded dynamically from CHANGELOG.md)
- Automated release script (`npm run release`) that updates version across all files

### Changed
- Version and changelog are now loaded dynamically instead of being hardcoded
- CHANGELOG.md moved to public/ directory for runtime access

## [2026.01.28-3] - 2026-01-28

### Added
- Tap tempo button to set BPM by tapping at desired tempo
  - Averages last 4 taps for accurate calculation
  - Resets after 2 seconds of inactivity
  - Visual feedback on tap

## [2026.01.28-2] - 2026-01-28

### Added
- Full ADSR envelope support for sound synthesis:
  - Attack (1-100 ms): time to reach peak volume
  - Decay (10-500 ms): time to fall to sustain level
  - Sustain (0-100%): held volume level as percentage of peak
  - Release (1-500 ms): time to fade to silence
- Sound presets dropdown in settings dialog:
  - Default: warm sine wave tones
  - Click: sharp traditional metronome sound (square wave, short envelope)
  - Clave: woody percussive sound (triangle wave, longer decay)
  - Beep: electronic tones with sustain
  - Hi-Hat: realistic metallic percussion with white noise
- White noise synthesis for percussion sounds:
  - New `noise` parameter (0-100%) controls oscillator/noise mix
  - Noise buffer generated per-beat using Web Audio API
- Scroll wheel support for all range sliders:
  - Tempo slider: ±1 BPM per scroll tick
  - Volume sliders: ±5% per scroll tick

### Changed
- Pitch range extended from 2000 Hz to 12000 Hz (for metallic hi-hat sounds)
- Default decay reduced from 80ms to 40ms (with 40ms release maintains similar duration)
- Settings dialog dropdowns now have consistent styling
- Test count increased from 131 to 136

## [2026.01.28-1] - 2026-01-28

### Added
- Main beat volume slider (0-100%, defaults to 100%)
- Code coverage reporting in test runner (text and HTML reports)
- Comprehensive test suite for app.js (previously untested)

### Changed
- Refactored `beatVolume` and `subdivisionVolumes` into unified `volumes` object
- New `setVolume(type, value)` and `resetVolumes()` methods replace type-specific methods
- Volume types: 'beat', 'eighth', 'sixteenth', 'triplet' (all 0-1 range)
- Test coverage now at 83.92% branches for app.js and 93.54% for metronome.js
- Total test count increased from 47 to 104 tests

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
