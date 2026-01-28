/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { Metronome } from '../public/js/metronome.js';

// Mock localStorage
let localStorageStore = {};
const localStorageMock = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, value) => {
    localStorageStore[key] = value;
  },
  removeItem: (key) => {
    delete localStorageStore[key];
  },
  clear: () => {
    localStorageStore = {};
  },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: () => Promise.resolve({ scope: '/' }),
  },
  writable: true,
});

// Setup DOM before importing app.js
function setupDOM() {
  document.body.innerHTML = `
    <div id="bpm-value">120</div>
    <input type="range" id="tempo-slider" min="1" max="300" value="120">
    <button id="tempo-down">-</button>
    <button id="tempo-up">+</button>
    <button id="tempo-down-5">-5</button>
    <button id="tempo-up-5">+5</button>
    <button id="tap-tempo">Tap Tempo</button>
    <select id="beats-select"></select>
    <select id="secondary-beats-select"><option value="0">None</option></select>
    <button id="play-btn">
      <span class="play-icon">▶</span>
      <span class="stop-icon hidden">■</span>
    </button>
    <div id="beat-indicators"></div>
    <input type="range" id="beat-volume" min="0" max="100" value="100">
    <span id="beat-value">100%</span>
    <input type="range" id="eighth-volume" min="0" max="100" value="0">
    <span id="eighth-value">0%</span>
    <input type="range" id="sixteenth-volume" min="0" max="100" value="0">
    <span id="sixteenth-value">0%</span>
    <input type="range" id="triplet-volume" min="0" max="100" value="0">
    <span id="triplet-value">0%</span>
    <button id="settings-btn">Settings</button>
    <dialog id="settings-dialog">
      <button id="settings-close">X</button>
      <button id="settings-reset">Reset</button>
      <select id="theme-select">
        <option value="default">Default</option>
        <option value="black">Black</option>
        <option value="light">Light</option>
      </select>
      <select id="sound-preset">
        <option value="default">Default</option>
        <option value="click">Click</option>
        <option value="clave">Clave</option>
        <option value="beep">Beep</option>
        <option value="hihat">Hi-Hat</option>
        <option value="custom">Custom</option>
      </select>
      <input type="number" id="accent-pitch" value="440">
      <input type="number" id="accent-attack" value="5">
      <input type="number" id="accent-decay" value="40">
      <input type="number" id="accent-sustain" value="50">
      <input type="number" id="accent-release" value="40">
      <select id="accent-waveform"><option value="sine">Sine</option></select>
      <input type="number" id="accent-noise" value="0">
      <input type="number" id="regular-pitch" value="880">
      <input type="number" id="regular-attack" value="5">
      <input type="number" id="regular-decay" value="40">
      <input type="number" id="regular-sustain" value="50">
      <input type="number" id="regular-release" value="40">
      <select id="regular-waveform"><option value="sine">Sine</option></select>
      <input type="number" id="regular-noise" value="0">
      <input type="number" id="subdivision-pitch" value="660">
      <input type="number" id="subdivision-attack" value="5">
      <input type="number" id="subdivision-decay" value="40">
      <input type="number" id="subdivision-sustain" value="50">
      <input type="number" id="subdivision-release" value="40">
      <select id="subdivision-waveform"><option value="sine">Sine</option></select>
      <input type="number" id="subdivision-noise" value="0">
    </dialog>
  `;

  // Mock dialog methods
  const dialog = document.getElementById('settings-dialog');
  dialog.showModal = jest.fn();
  dialog.close = jest.fn();
  Object.defineProperty(dialog, 'open', {
    get: jest.fn(() => false),
    configurable: true,
  });
}

describe('App', () => {
  beforeEach(async () => {
    jest.resetModules();
    localStorageMock.clear();
    setupDOM();
  });

  describe('DOM initialization', () => {
    test('beats select is populated with options 1-20', async () => {
      await import('../public/js/app.js');

      const beatsSelect = document.getElementById('beats-select');
      expect(beatsSelect.options.length).toBe(20);
      expect(beatsSelect.options[0].value).toBe('1');
      expect(beatsSelect.options[19].value).toBe('20');
    });

    test('secondary beats select is populated with options 1-20 plus None', async () => {
      await import('../public/js/app.js');

      const secondaryBeatsSelect = document.getElementById('secondary-beats-select');
      expect(secondaryBeatsSelect.options.length).toBe(21);
      expect(secondaryBeatsSelect.options[0].value).toBe('0');
      expect(secondaryBeatsSelect.options[1].value).toBe('1');
    });

    test('beat indicators are created', async () => {
      await import('../public/js/app.js');

      const indicators = document.querySelectorAll('.beat-indicator');
      expect(indicators.length).toBe(4); // Default 4 beats per measure
    });
  });

  describe('scroll wheel support', () => {
    test('tempo slider responds to scroll wheel up', async () => {
      await import('../public/js/app.js');

      const tempoSlider = document.getElementById('tempo-slider');
      const bpmValue = document.getElementById('bpm-value');

      // Scroll up (negative deltaY)
      const wheelEvent = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
      tempoSlider.dispatchEvent(wheelEvent);

      expect(bpmValue.textContent).toBe('121');
    });

    test('tempo slider responds to scroll wheel down', async () => {
      await import('../public/js/app.js');

      const tempoSlider = document.getElementById('tempo-slider');
      const bpmValue = document.getElementById('bpm-value');

      // Scroll down (positive deltaY)
      const wheelEvent = new WheelEvent('wheel', { deltaY: 100, bubbles: true });
      tempoSlider.dispatchEvent(wheelEvent);

      expect(bpmValue.textContent).toBe('119');
    });

    test('volume slider responds to scroll wheel', async () => {
      await import('../public/js/app.js');

      const beatVolume = document.getElementById('beat-volume');
      const beatValue = document.getElementById('beat-value');

      // Scroll down (positive deltaY) - decreases by 5
      const wheelEvent = new WheelEvent('wheel', { deltaY: 100, bubbles: true });
      beatVolume.dispatchEvent(wheelEvent);

      expect(beatValue.textContent).toBe('95%');
    });

    test('scroll wheel respects min/max bounds', async () => {
      await import('../public/js/app.js');

      const tempoSlider = document.getElementById('tempo-slider');
      const bpmValue = document.getElementById('bpm-value');

      // Set to max
      tempoSlider.value = '300';
      tempoSlider.dispatchEvent(new Event('input'));

      // Try to scroll up past max
      const wheelEvent = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
      tempoSlider.dispatchEvent(wheelEvent);

      expect(bpmValue.textContent).toBe('300');
    });
  });

  describe('tempo controls', () => {
    test('tempo slider updates BPM display', async () => {
      await import('../public/js/app.js');

      const tempoSlider = document.getElementById('tempo-slider');
      const bpmValue = document.getElementById('bpm-value');

      tempoSlider.value = '150';
      tempoSlider.dispatchEvent(new Event('input'));

      expect(bpmValue.textContent).toBe('150');
    });

    test('tempo up button increases BPM by 1', async () => {
      await import('../public/js/app.js');

      const tempoUp = document.getElementById('tempo-up');
      const bpmValue = document.getElementById('bpm-value');

      tempoUp.click();

      expect(bpmValue.textContent).toBe('121');
    });

    test('tempo down button decreases BPM by 1', async () => {
      await import('../public/js/app.js');

      const tempoDown = document.getElementById('tempo-down');
      const bpmValue = document.getElementById('bpm-value');

      tempoDown.click();

      expect(bpmValue.textContent).toBe('119');
    });

    test('tempo up 5 button increases BPM by 5', async () => {
      await import('../public/js/app.js');

      const tempoUp5 = document.getElementById('tempo-up-5');
      const bpmValue = document.getElementById('bpm-value');

      tempoUp5.click();

      expect(bpmValue.textContent).toBe('125');
    });

    test('tempo down 5 button decreases BPM by 5', async () => {
      await import('../public/js/app.js');

      const tempoDown5 = document.getElementById('tempo-down-5');
      const bpmValue = document.getElementById('bpm-value');

      tempoDown5.click();

      expect(bpmValue.textContent).toBe('115');
    });

    test('tempo down does not go below minimum', async () => {
      await import('../public/js/app.js');

      const tempoSlider = document.getElementById('tempo-slider');
      const tempoDown = document.getElementById('tempo-down');
      const bpmValue = document.getElementById('bpm-value');

      tempoSlider.value = '1';
      tempoSlider.dispatchEvent(new Event('input'));
      tempoDown.click();

      expect(bpmValue.textContent).toBe('1');
    });

    test('tempo up does not go above maximum', async () => {
      await import('../public/js/app.js');

      const tempoSlider = document.getElementById('tempo-slider');
      const tempoUp = document.getElementById('tempo-up');
      const bpmValue = document.getElementById('bpm-value');

      tempoSlider.value = '300';
      tempoSlider.dispatchEvent(new Event('input'));
      tempoUp.click();

      expect(bpmValue.textContent).toBe('300');
    });
  });

  describe('tap tempo', () => {
    test('tap tempo button exists', async () => {
      await import('../public/js/app.js');

      const tapTempoBtn = document.getElementById('tap-tempo');
      expect(tapTempoBtn).not.toBeNull();
    });

    test('single tap does not change tempo', async () => {
      await import('../public/js/app.js');

      const tapTempoBtn = document.getElementById('tap-tempo');
      const bpmValue = document.getElementById('bpm-value');

      tapTempoBtn.click();

      expect(bpmValue.textContent).toBe('120'); // Unchanged
    });

    test('multiple taps calculate tempo', async () => {
      jest.useFakeTimers();
      await import('../public/js/app.js');

      const tapTempoBtn = document.getElementById('tap-tempo');
      const bpmValue = document.getElementById('bpm-value');

      // Simulate taps at 500ms intervals (120 BPM)
      tapTempoBtn.click();
      jest.advanceTimersByTime(500);
      tapTempoBtn.click();
      jest.advanceTimersByTime(500);
      tapTempoBtn.click();

      // Should calculate ~120 BPM
      expect(bpmValue.textContent).toBe('120');

      jest.useRealTimers();
    });

    test('taps with 600ms intervals calculate 100 BPM', async () => {
      jest.useFakeTimers();
      await import('../public/js/app.js');

      const tapTempoBtn = document.getElementById('tap-tempo');
      const bpmValue = document.getElementById('bpm-value');

      // Simulate taps at 600ms intervals (100 BPM)
      tapTempoBtn.click();
      jest.advanceTimersByTime(600);
      tapTempoBtn.click();
      jest.advanceTimersByTime(600);
      tapTempoBtn.click();

      expect(bpmValue.textContent).toBe('100');

      jest.useRealTimers();
    });

    test('tap tempo resets after 2 second gap', async () => {
      jest.useFakeTimers();
      await import('../public/js/app.js');

      const tapTempoBtn = document.getElementById('tap-tempo');
      const bpmValue = document.getElementById('bpm-value');

      // First set of taps at 500ms (120 BPM)
      tapTempoBtn.click();
      jest.advanceTimersByTime(500);
      tapTempoBtn.click();
      expect(bpmValue.textContent).toBe('120');

      // Wait 2.5 seconds (should reset)
      jest.advanceTimersByTime(2500);

      // New taps at 1000ms (60 BPM)
      tapTempoBtn.click();
      jest.advanceTimersByTime(1000);
      tapTempoBtn.click();

      expect(bpmValue.textContent).toBe('60');

      jest.useRealTimers();
    });

    test('tap tempo adds active class briefly', async () => {
      jest.useFakeTimers();
      await import('../public/js/app.js');

      const tapTempoBtn = document.getElementById('tap-tempo');

      tapTempoBtn.click();

      expect(tapTempoBtn.classList.contains('active')).toBe(true);

      jest.advanceTimersByTime(150);

      expect(tapTempoBtn.classList.contains('active')).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('beats controls', () => {
    test('changing beats select updates beat indicators', async () => {
      await import('../public/js/app.js');

      const beatsSelect = document.getElementById('beats-select');
      beatsSelect.value = '7';
      beatsSelect.dispatchEvent(new Event('change'));

      const indicators = document.querySelectorAll('.beat-indicator');
      expect(indicators.length).toBe(7);
    });

    test('changing secondary beats creates separator and additional indicators', async () => {
      await import('../public/js/app.js');

      const secondaryBeatsSelect = document.getElementById('secondary-beats-select');
      secondaryBeatsSelect.value = '3';
      secondaryBeatsSelect.dispatchEvent(new Event('change'));

      const indicators = document.querySelectorAll('.beat-indicator');
      const separator = document.querySelector('.beat-separator');
      expect(indicators.length).toBe(7); // 4 primary + 3 secondary
      expect(separator).not.toBeNull();
    });

    test('setting secondary beats to None removes separator', async () => {
      await import('../public/js/app.js');

      const secondaryBeatsSelect = document.getElementById('secondary-beats-select');

      // First add secondary beats
      secondaryBeatsSelect.value = '3';
      secondaryBeatsSelect.dispatchEvent(new Event('change'));

      // Then remove them
      secondaryBeatsSelect.value = '0';
      secondaryBeatsSelect.dispatchEvent(new Event('change'));

      const separator = document.querySelector('.beat-separator');
      expect(separator).toBeNull();
    });
  });

  describe('volume sliders', () => {
    test('beat volume slider updates display', async () => {
      await import('../public/js/app.js');

      const beatVolume = document.getElementById('beat-volume');
      const beatValue = document.getElementById('beat-value');

      beatVolume.value = '50';
      beatVolume.dispatchEvent(new Event('input'));

      expect(beatValue.textContent).toBe('50%');
    });

    test('eighth volume slider updates display', async () => {
      await import('../public/js/app.js');

      const eighthVolume = document.getElementById('eighth-volume');
      const eighthValue = document.getElementById('eighth-value');

      eighthVolume.value = '75';
      eighthVolume.dispatchEvent(new Event('input'));

      expect(eighthValue.textContent).toBe('75%');
    });

    test('sixteenth volume slider updates display', async () => {
      await import('../public/js/app.js');

      const sixteenthVolume = document.getElementById('sixteenth-volume');
      const sixteenthValue = document.getElementById('sixteenth-value');

      sixteenthVolume.value = '25';
      sixteenthVolume.dispatchEvent(new Event('input'));

      expect(sixteenthValue.textContent).toBe('25%');
    });

    test('triplet volume slider updates display', async () => {
      await import('../public/js/app.js');

      const tripletVolume = document.getElementById('triplet-volume');
      const tripletValue = document.getElementById('triplet-value');

      tripletVolume.value = '60';
      tripletVolume.dispatchEvent(new Event('input'));

      expect(tripletValue.textContent).toBe('60%');
    });
  });

  describe('play button', () => {
    test('play button toggles playing state', async () => {
      await import('../public/js/app.js');

      const playBtn = document.getElementById('play-btn');
      const playIcon = playBtn.querySelector('.play-icon');
      const stopIcon = playBtn.querySelector('.stop-icon');

      // Initial state
      expect(playIcon.classList.contains('hidden')).toBe(false);
      expect(stopIcon.classList.contains('hidden')).toBe(true);

      // Click to start
      playBtn.click();
      expect(playBtn.classList.contains('playing')).toBe(true);

      // Click to stop
      playBtn.click();
      expect(playBtn.classList.contains('playing')).toBe(false);
    });
  });

  describe('settings dialog', () => {
    test('settings button opens dialog', async () => {
      await import('../public/js/app.js');

      const settingsBtn = document.getElementById('settings-btn');
      const settingsDialog = document.getElementById('settings-dialog');

      settingsBtn.click();

      expect(settingsDialog.showModal).toHaveBeenCalled();
    });

    test('close button closes dialog', async () => {
      await import('../public/js/app.js');

      const settingsClose = document.getElementById('settings-close');
      const settingsDialog = document.getElementById('settings-dialog');

      settingsClose.click();

      expect(settingsDialog.close).toHaveBeenCalled();
    });

    test('theme select changes theme', async () => {
      await import('../public/js/app.js');

      const themeSelect = document.getElementById('theme-select');

      themeSelect.value = 'black';
      themeSelect.dispatchEvent(new Event('change'));

      expect(document.documentElement.getAttribute('data-theme')).toBe('black');
    });

    test('reset button resets volumes to defaults', async () => {
      await import('../public/js/app.js');

      const beatVolume = document.getElementById('beat-volume');
      const beatValue = document.getElementById('beat-value');
      const eighthVolume = document.getElementById('eighth-volume');
      const settingsReset = document.getElementById('settings-reset');

      // Change values
      beatVolume.value = '50';
      beatVolume.dispatchEvent(new Event('input'));
      eighthVolume.value = '75';
      eighthVolume.dispatchEvent(new Event('input'));

      // Reset
      settingsReset.click();

      expect(beatVolume.value).toBe('100');
      expect(beatValue.textContent).toBe('100%');
      expect(eighthVolume.value).toBe('0');
    });
  });

  describe('localStorage persistence', () => {
    test('settings are saved to localStorage', async () => {
      await import('../public/js/app.js');

      const tempoSlider = document.getElementById('tempo-slider');
      tempoSlider.value = '150';
      tempoSlider.dispatchEvent(new Event('input'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.bpm).toBe(150);
    });

    test('settings are loaded from localStorage on init', async () => {
      const savedSettings = {
        bpm: 180,
        beatsPerMeasure: 6,
        volumes: { beat: 0.8, eighth: 0.5, sixteenth: 0, triplet: 0 },
        theme: 'light',
      };
      localStorageStore['mr-taps-settings'] = JSON.stringify(savedSettings);

      await import('../public/js/app.js');

      const bpmValue = document.getElementById('bpm-value');
      expect(bpmValue.textContent).toBe('180');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('loads secondary beats from localStorage', async () => {
      const savedSettings = {
        bpm: 120,
        beatsPerMeasure: 3,
        secondaryBeatsPerMeasure: 4,
        volumes: { beat: 1, eighth: 0, sixteenth: 0, triplet: 0 },
      };
      localStorageStore['mr-taps-settings'] = JSON.stringify(savedSettings);

      await import('../public/js/app.js');

      const indicators = document.querySelectorAll('.beat-indicator');
      const separator = document.querySelector('.beat-separator');
      expect(indicators.length).toBe(7); // 3 + 4
      expect(separator).not.toBeNull();
    });

    test('loads sound settings from localStorage', async () => {
      const savedSettings = {
        bpm: 120,
        beatsPerMeasure: 4,
        soundSettings: {
          accent: { pitch: 500, decay: 0.1, waveform: 'square', gain: 1.0 },
          regular: { pitch: 900, decay: 0.1, waveform: 'sine', gain: 0.7 },
          subdivision: { pitch: 700, decay: 0.1, waveform: 'sine', gain: 0.3 },
        },
      };
      localStorageStore['mr-taps-settings'] = JSON.stringify(savedSettings);

      await import('../public/js/app.js');

      // Verify it loaded without error
      const bpmValue = document.getElementById('bpm-value');
      expect(bpmValue.textContent).toBe('120');
    });
  });

  describe('keyboard controls', () => {
    test('spacebar toggles play when dialog is closed', async () => {
      await import('../public/js/app.js');

      const playBtn = document.getElementById('play-btn');

      const event = new KeyboardEvent('keydown', { code: 'Space' });
      document.dispatchEvent(event);

      expect(playBtn.classList.contains('playing')).toBe(true);
    });

    test('spacebar stops when already playing', async () => {
      await import('../public/js/app.js');

      const playBtn = document.getElementById('play-btn');

      // Start playing
      const startEvent = new KeyboardEvent('keydown', { code: 'Space' });
      document.dispatchEvent(startEvent);
      expect(playBtn.classList.contains('playing')).toBe(true);

      // Stop playing
      const stopEvent = new KeyboardEvent('keydown', { code: 'Space' });
      document.dispatchEvent(stopEvent);
      expect(playBtn.classList.contains('playing')).toBe(false);
    });

    test('escape closes settings dialog when open', async () => {
      await import('../public/js/app.js');

      const settingsDialog = document.getElementById('settings-dialog');
      Object.defineProperty(settingsDialog, 'open', {
        get: () => true,
        configurable: true,
      });

      const event = new KeyboardEvent('keydown', { code: 'Escape' });
      document.dispatchEvent(event);

      expect(settingsDialog.close).toHaveBeenCalled();
    });

    test('spacebar does not toggle play when dialog is open', async () => {
      await import('../public/js/app.js');

      const playBtn = document.getElementById('play-btn');
      const settingsDialog = document.getElementById('settings-dialog');
      Object.defineProperty(settingsDialog, 'open', {
        get: () => true,
        configurable: true,
      });

      const event = new KeyboardEvent('keydown', { code: 'Space' });
      document.dispatchEvent(event);

      // Should not start playing because dialog is open
      expect(playBtn.classList.contains('playing')).toBe(false);
    });
  });

  describe('sound settings', () => {
    test('pitch input updates metronome settings', async () => {
      await import('../public/js/app.js');

      const accentPitch = document.getElementById('accent-pitch');
      accentPitch.value = '500';
      accentPitch.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundSettings.accent.pitch).toBe(500);
    });

    test('decay input updates metronome settings', async () => {
      await import('../public/js/app.js');

      const accentDecay = document.getElementById('accent-decay');
      accentDecay.value = '100';
      accentDecay.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundSettings.accent.decay).toBe(0.1);
    });

    test('waveform select updates metronome settings', async () => {
      await import('../public/js/app.js');

      const accentWaveform = document.getElementById('accent-waveform');
      accentWaveform.innerHTML = '<option value="sine">Sine</option><option value="square">Square</option>';
      accentWaveform.value = 'square';
      accentWaveform.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundSettings.accent.waveform).toBe('square');
    });

    test('pitch input clamps to valid range', async () => {
      await import('../public/js/app.js');

      const accentPitch = document.getElementById('accent-pitch');

      // Test below minimum
      accentPitch.value = '50';
      accentPitch.dispatchEvent(new Event('change'));
      expect(accentPitch.value).toBe('100');

      // Test above maximum
      accentPitch.value = '15000';
      accentPitch.dispatchEvent(new Event('change'));
      expect(accentPitch.value).toBe('12000');
    });

    test('decay input clamps to valid range', async () => {
      await import('../public/js/app.js');

      const accentDecay = document.getElementById('accent-decay');

      // Test below minimum
      accentDecay.value = '5';
      accentDecay.dispatchEvent(new Event('change'));
      expect(accentDecay.value).toBe('10');

      // Test above maximum
      accentDecay.value = '600';
      accentDecay.dispatchEvent(new Event('change'));
      expect(accentDecay.value).toBe('500');
    });

    test('attack input updates metronome settings', async () => {
      await import('../public/js/app.js');

      const accentAttack = document.getElementById('accent-attack');
      accentAttack.value = '10';
      accentAttack.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundSettings.accent.attack).toBe(0.01);
    });

    test('attack input clamps to valid range', async () => {
      await import('../public/js/app.js');

      const accentAttack = document.getElementById('accent-attack');

      // Test below minimum
      accentAttack.value = '0';
      accentAttack.dispatchEvent(new Event('change'));
      expect(accentAttack.value).toBe('1');

      // Test above maximum
      accentAttack.value = '200';
      accentAttack.dispatchEvent(new Event('change'));
      expect(accentAttack.value).toBe('100');
    });

    test('sustain input updates metronome settings', async () => {
      await import('../public/js/app.js');

      const accentSustain = document.getElementById('accent-sustain');
      accentSustain.value = '75';
      accentSustain.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundSettings.accent.sustain).toBe(0.75);
    });

    test('sustain input clamps to valid range', async () => {
      await import('../public/js/app.js');

      const accentSustain = document.getElementById('accent-sustain');

      // Test below minimum (should allow 0)
      accentSustain.value = '-10';
      accentSustain.dispatchEvent(new Event('change'));
      expect(accentSustain.value).toBe('0');

      // Test above maximum
      accentSustain.value = '150';
      accentSustain.dispatchEvent(new Event('change'));
      expect(accentSustain.value).toBe('100');
    });

    test('release input updates metronome settings', async () => {
      await import('../public/js/app.js');

      const accentRelease = document.getElementById('accent-release');
      accentRelease.value = '100';
      accentRelease.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundSettings.accent.release).toBe(0.1);
    });

    test('release input clamps to valid range', async () => {
      await import('../public/js/app.js');

      const accentRelease = document.getElementById('accent-release');

      // Test below minimum
      accentRelease.value = '0';
      accentRelease.dispatchEvent(new Event('change'));
      expect(accentRelease.value).toBe('1');

      // Test above maximum
      accentRelease.value = '600';
      accentRelease.dispatchEvent(new Event('change'));
      expect(accentRelease.value).toBe('500');
    });

    test('noise input updates metronome settings', async () => {
      await import('../public/js/app.js');

      const accentNoise = document.getElementById('accent-noise');
      accentNoise.value = '50';
      accentNoise.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundSettings.accent.noise).toBe(0.5);
    });

    test('noise input clamps to valid range', async () => {
      await import('../public/js/app.js');

      const accentNoise = document.getElementById('accent-noise');

      // Test below minimum (should allow 0)
      accentNoise.value = '-10';
      accentNoise.dispatchEvent(new Event('change'));
      expect(accentNoise.value).toBe('0');

      // Test above maximum
      accentNoise.value = '150';
      accentNoise.dispatchEvent(new Event('change'));
      expect(accentNoise.value).toBe('100');
    });
  });

  describe('sound presets', () => {
    test('sound preset dropdown applies preset', async () => {
      await import('../public/js/app.js');

      const soundPreset = document.getElementById('sound-preset');
      const accentPitch = document.getElementById('accent-pitch');

      soundPreset.value = 'click';
      soundPreset.dispatchEvent(new Event('change'));

      expect(accentPitch.value).toBe('1000');
    });

    test('changing sound setting sets preset to custom', async () => {
      await import('../public/js/app.js');

      const soundPreset = document.getElementById('sound-preset');
      const accentPitch = document.getElementById('accent-pitch');

      accentPitch.value = '500';
      accentPitch.dispatchEvent(new Event('change'));

      expect(soundPreset.value).toBe('custom');
    });

    test('reset button resets preset to default', async () => {
      await import('../public/js/app.js');

      const soundPreset = document.getElementById('sound-preset');
      const settingsReset = document.getElementById('settings-reset');

      // Change to a different preset
      soundPreset.value = 'click';
      soundPreset.dispatchEvent(new Event('change'));

      // Reset
      settingsReset.click();

      expect(soundPreset.value).toBe('default');
    });

    test('sound preset is saved to localStorage', async () => {
      await import('../public/js/app.js');

      const soundPreset = document.getElementById('sound-preset');

      soundPreset.value = 'clave';
      soundPreset.dispatchEvent(new Event('change'));

      const savedSettings = JSON.parse(localStorageStore['mr-taps-settings']);
      expect(savedSettings.soundPreset).toBe('clave');
    });

    test('sound preset is loaded from localStorage', async () => {
      const savedSettings = {
        bpm: 120,
        beatsPerMeasure: 4,
        soundPreset: 'beep',
        soundSettings: {
          accent: { pitch: 880, attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.05, waveform: 'sine', gain: 1.0 },
          regular: { pitch: 1760, attack: 0.01, decay: 0.04, sustain: 0.7, release: 0.04, waveform: 'sine', gain: 0.7 },
          subdivision: { pitch: 1320, attack: 0.01, decay: 0.03, sustain: 0.6, release: 0.03, waveform: 'sine', gain: 0.3 },
        },
      };
      localStorageStore['mr-taps-settings'] = JSON.stringify(savedSettings);

      await import('../public/js/app.js');

      // Open settings dialog to trigger UI update
      const settingsBtn = document.getElementById('settings-btn');
      settingsBtn.click();

      const soundPreset = document.getElementById('sound-preset');
      expect(soundPreset.value).toBe('beep');
    });
  });
});
