import { Metronome } from './metronome.js';

// Storage key for localStorage
const STORAGE_KEY = 'mr-taps-settings';

// DOM Elements
const bpmValue = document.getElementById('bpm-value');
const tempoSlider = document.getElementById('tempo-slider');
const tempoDown = document.getElementById('tempo-down');
const tempoUp = document.getElementById('tempo-up');
const beatsSelect = document.getElementById('beats-select');
const subdivisionSelect = document.getElementById('subdivision-select');
const playBtn = document.getElementById('play-btn');
const beatIndicators = document.getElementById('beat-indicators');
const playIcon = playBtn.querySelector('.play-icon');
const stopIcon = playBtn.querySelector('.stop-icon');

// Settings Dialog Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsDialog = document.getElementById('settings-dialog');
const settingsClose = document.getElementById('settings-close');
const settingsReset = document.getElementById('settings-reset');

// Sound setting inputs
const soundInputs = {
  accent: {
    pitch: document.getElementById('accent-pitch'),
    decay: document.getElementById('accent-decay'),
    waveform: document.getElementById('accent-waveform'),
  },
  regular: {
    pitch: document.getElementById('regular-pitch'),
    decay: document.getElementById('regular-decay'),
    waveform: document.getElementById('regular-waveform'),
  },
  subdivision: {
    pitch: document.getElementById('subdivision-pitch'),
    decay: document.getElementById('subdivision-decay'),
    waveform: document.getElementById('subdivision-waveform'),
  },
};

// Initialize metronome
const metronome = new Metronome();

// Save all settings to localStorage
function saveSettings() {
  const settings = {
    bpm: metronome.bpm,
    beatsPerMeasure: metronome.beatsPerMeasure,
    subdivision: metronome.subdivision,
    soundSettings: metronome.soundSettings,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save settings to localStorage:', e);
  }
}

// Load settings from localStorage
function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);

      if (settings.bpm) {
        metronome.setTempo(settings.bpm);
      }
      if (settings.beatsPerMeasure) {
        metronome.setBeatsPerMeasure(settings.beatsPerMeasure);
      }
      if (settings.subdivision) {
        metronome.setSubdivision(settings.subdivision);
      }
      if (settings.soundSettings) {
        for (const beatType of ['accent', 'regular', 'subdivision']) {
          if (settings.soundSettings[beatType]) {
            metronome.setSoundSettings(beatType, settings.soundSettings[beatType]);
          }
        }
      }
      return true;
    }
  } catch (e) {
    console.warn('Could not load settings from localStorage:', e);
  }
  return false;
}

// Initialize UI
function initUI() {
  // Load saved settings first
  loadSettings();

  // Populate beats select (1-20)
  for (let i = 1; i <= 20; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    beatsSelect.appendChild(option);
  }

  // Set UI to match metronome state
  bpmValue.textContent = metronome.bpm;
  tempoSlider.value = metronome.bpm;
  beatsSelect.value = metronome.beatsPerMeasure;
  subdivisionSelect.value = metronome.subdivision;

  // Create beat indicators
  updateBeatIndicators();
}

// Update beat indicators based on beats per measure
function updateBeatIndicators() {
  beatIndicators.innerHTML = '';
  for (let i = 0; i < metronome.beatsPerMeasure; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'beat-indicator';
    indicator.dataset.beat = i;
    beatIndicators.appendChild(indicator);
  }
}

// Update BPM display and slider
function updateBpmDisplay() {
  bpmValue.textContent = metronome.bpm;
  tempoSlider.value = metronome.bpm;
}

// Highlight active beat indicator
function highlightBeat(beatInfo) {
  const indicators = beatIndicators.querySelectorAll('.beat-indicator');
  indicators.forEach((indicator, index) => {
    indicator.classList.remove('active', 'accent');
    if (index === beatInfo.beat && beatInfo.subdivision === 0) {
      indicator.classList.add('active');
      if (beatInfo.isAccent) {
        indicator.classList.add('accent');
      }
    }
  });
}

// Reset beat indicators
function resetBeatIndicators() {
  const indicators = beatIndicators.querySelectorAll('.beat-indicator');
  indicators.forEach((indicator) => {
    indicator.classList.remove('active', 'accent');
  });
}

// Update play button state
function updatePlayButton(isPlaying) {
  playBtn.classList.toggle('playing', isPlaying);
  playIcon.classList.toggle('hidden', isPlaying);
  stopIcon.classList.toggle('hidden', !isPlaying);
}

// Event Listeners
tempoSlider.addEventListener('input', (e) => {
  const bpm = parseInt(e.target.value, 10);
  metronome.setTempo(bpm);
  bpmValue.textContent = bpm;
  saveSettings();
});

tempoDown.addEventListener('click', () => {
  if (metronome.bpm > Metronome.MIN_BPM) {
    metronome.setTempo(metronome.bpm - 1);
    updateBpmDisplay();
    saveSettings();
  }
});

tempoUp.addEventListener('click', () => {
  if (metronome.bpm < Metronome.MAX_BPM) {
    metronome.setTempo(metronome.bpm + 1);
    updateBpmDisplay();
    saveSettings();
  }
});

beatsSelect.addEventListener('change', (e) => {
  const beats = parseInt(e.target.value, 10);
  metronome.setBeatsPerMeasure(beats);
  updateBeatIndicators();
  saveSettings();
});

subdivisionSelect.addEventListener('change', (e) => {
  const subdivision = parseInt(e.target.value, 10);
  metronome.setSubdivision(subdivision);
  saveSettings();
});

playBtn.addEventListener('click', () => {
  metronome.toggle();
  updatePlayButton(metronome.isPlaying);
  if (!metronome.isPlaying) {
    resetBeatIndicators();
  }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !settingsDialog.open) {
    e.preventDefault();
    metronome.toggle();
    updatePlayButton(metronome.isPlaying);
    if (!metronome.isPlaying) {
      resetBeatIndicators();
    }
  }
  if (e.code === 'Escape' && settingsDialog.open) {
    settingsDialog.close();
  }
});

// Set up beat callback
metronome.onBeat = highlightBeat;

// Settings Dialog Functions
function updateSettingsUI() {
  const settings = metronome.soundSettings;
  for (const beatType of ['accent', 'regular', 'subdivision']) {
    soundInputs[beatType].pitch.value = settings[beatType].pitch;
    soundInputs[beatType].decay.value = Math.round(settings[beatType].decay * 1000);
    soundInputs[beatType].waveform.value = settings[beatType].waveform;
  }
}

function applySoundSetting(beatType, setting, value) {
  if (setting === 'decay') {
    // Convert ms to seconds
    metronome.setSoundSettings(beatType, { decay: value / 1000 });
  } else {
    metronome.setSoundSettings(beatType, { [setting]: value });
  }
  saveSettings();
}

// Settings Dialog Event Listeners
settingsBtn.addEventListener('click', () => {
  updateSettingsUI();
  settingsDialog.showModal();
});

settingsClose.addEventListener('click', () => {
  settingsDialog.close();
});

settingsDialog.addEventListener('click', (e) => {
  // Close when clicking backdrop
  if (e.target === settingsDialog) {
    settingsDialog.close();
  }
});

settingsReset.addEventListener('click', () => {
  metronome.resetSoundSettings();
  updateSettingsUI();
  saveSettings();
});

// Add event listeners for all sound setting inputs
for (const beatType of ['accent', 'regular', 'subdivision']) {
  soundInputs[beatType].pitch.addEventListener('change', (e) => {
    const value = Math.max(100, Math.min(2000, parseInt(e.target.value, 10) || 440));
    e.target.value = value;
    applySoundSetting(beatType, 'pitch', value);
  });

  soundInputs[beatType].decay.addEventListener('change', (e) => {
    const value = Math.max(10, Math.min(500, parseInt(e.target.value, 10) || 80));
    e.target.value = value;
    applySoundSetting(beatType, 'decay', value);
  });

  soundInputs[beatType].waveform.addEventListener('change', (e) => {
    applySoundSetting(beatType, 'waveform', e.target.value);
  });
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(
      (registration) => {
        console.log('ServiceWorker registered:', registration.scope);
      },
      (error) => {
        console.log('ServiceWorker registration failed:', error);
      }
    );
  });
}

// Initialize the app
initUI();
