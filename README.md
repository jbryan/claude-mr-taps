# Mr. Taps

Mr. Taps is a metronome application implemented as a Progressive Web App
(PWA). Since it is a PWA, it can be installed on mobile devices and used with
no internet connection.

## Features

- **Tempo Control**: Supports tempos from 1 BPM up to 300 BPM with ±1 and ±5 buttons
- **Time Signature**: Set the number of beats in a measure from 1 to 20
- **Compound Time**: Optional secondary beats for asymmetric meters (e.g., 7/4 as 3+4)
- **Subdivisions**: Independent volume controls for 8ths, 16ths, and triplets (can layer all three)
- **Color Themes**: Default (dark blue), Black (green accents), and Light themes
- **Audio**: Uses Web Audio API to generate precise 440Hz beeps
- **Offline Support**: Works without an internet connection once installed
- **Installable**: Can be added to your home screen on mobile devices

## Project Structure

```
metronome/
├── package.json           # Project configuration and scripts
├── jest.config.js         # Jest test configuration
├── tests/
│   ├── setup.js           # Web Audio API mocks for testing
│   └── metronome.test.js  # Test suite
├── scripts/
│   └── generate-icons.js  # Script to generate PWA icons
└── public/
    ├── index.html         # Main HTML page
    ├── manifest.json      # PWA manifest
    ├── sw.js              # Service worker for offline support
    ├── css/
    │   └── styles.css     # Application styles
    ├── js/
    │   ├── metronome.js   # Core Metronome class
    │   └── app.js         # UI logic and event handling
    └── icons/
        ├── icon-192.png   # PWA icon (192x192)
        └── icon-512.png   # PWA icon (512x512)
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

To start a local development server:

```bash
npm run start
```

This will serve the app at `http://localhost:3000` (or another available port).

Alternatively, you can use any static file server to serve the `public/` directory.

## Testing

To run the test suite:

```bash
npm run test
```

The test suite includes 45 tests covering:
- Metronome initialization and default values
- Tempo setting and validation (1-300 BPM)
- Beats per measure setting and validation (1-20)
- Subdivision volume controls
- Beat interval calculations
- Start/stop functionality
- Toggle behavior
- Callback functionality
- Sound settings

## Usage

### Controls

- **Tempo Slider**: Drag to adjust BPM (1-300)
- **+/- Buttons**: Fine-tune tempo by 1 BPM
- **±5 Buttons**: Adjust tempo by 5 BPM
- **Primary Beats**: Select 1-20 beats per measure
- **Secondary Beats**: Optional second measure for compound time (None, or 1-20)
- **Subdivision Sliders**: Independently control volume (0-100%) for:
  - 8ths (&): plays at 50% through each beat
  - 16ths (e, a): plays at 25% and 75% through each beat
  - Triplets: plays at 33% and 66% through each beat
- **Play/Stop Button**: Start or stop the metronome
- **Spacebar**: Keyboard shortcut to toggle play/stop
- **Settings**: Color theme selection and sound customization

### Sound Guide

- **Accented beat (first beat)**: 440Hz tone at full volume
- **Regular beats**: 880Hz tone at 70% volume
- **Subdivisions**: 660Hz tone at 30% volume

## PWA Installation

### On Mobile (iOS/Android)

1. Open the app in your mobile browser
2. Tap the share button (iOS) or menu button (Android)
3. Select "Add to Home Screen"
4. The app will now be available as a standalone application

### On Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Click the install icon in the address bar
3. Confirm the installation

## Browser Support

Mr. Taps requires a browser with Web Audio API support:
- Chrome 35+
- Firefox 25+
- Safari 14.1+
- Edge 79+

## License

MIT
