import { Metronome } from './metronome.js';

// Storage key for localStorage
const STORAGE_KEY = 'mr-taps-settings';

// DOM Elements
const bpmValue = document.getElementById('bpm-value');
const tempoSlider = document.getElementById('tempo-slider');
const tempoDown = document.getElementById('tempo-down');
const tempoUp = document.getElementById('tempo-up');
const tempoDown5 = document.getElementById('tempo-down-5');
const tempoUp5 = document.getElementById('tempo-up-5');
const beatsSelect = document.getElementById('beats-select');
const secondaryBeatsSelect = document.getElementById('secondary-beats-select');
const playBtn = document.getElementById('play-btn');

// Volume sliders
const volumeSliders = {
  beat: document.getElementById('beat-volume'),
  eighth: document.getElementById('eighth-volume'),
  sixteenth: document.getElementById('sixteenth-volume'),
  triplet: document.getElementById('triplet-volume'),
};
const volumeDisplays = {
  beat: document.getElementById('beat-value'),
  eighth: document.getElementById('eighth-value'),
  sixteenth: document.getElementById('sixteenth-value'),
  triplet: document.getElementById('triplet-value'),
};
const beatIndicators = document.getElementById('beat-indicators');
const playIcon = playBtn.querySelector('.play-icon');
const stopIcon = playBtn.querySelector('.stop-icon');

// Settings Dialog Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsDialog = document.getElementById('settings-dialog');
const settingsClose = document.getElementById('settings-close');
const settingsReset = document.getElementById('settings-reset');
const themeSelect = document.getElementById('theme-select');

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

// Current theme
let currentTheme = 'default';

// Apply theme to document
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
}

// Save all settings to localStorage
function saveSettings() {
  const settings = {
    bpm: metronome.bpm,
    beatsPerMeasure: metronome.beatsPerMeasure,
    secondaryBeatsPerMeasure: metronome.secondaryBeatsPerMeasure,
    volumes: metronome.volumes,
    soundSettings: metronome.soundSettings,
    theme: currentTheme,
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
      if (settings.secondaryBeatsPerMeasure !== undefined) {
        metronome.setSecondaryBeatsPerMeasure(settings.secondaryBeatsPerMeasure);
      }
      if (settings.volumes) {
        for (const type of ['beat', 'eighth', 'sixteenth', 'triplet']) {
          if (settings.volumes[type] !== undefined) {
            metronome.setVolume(type, settings.volumes[type]);
          }
        }
      }
      if (settings.soundSettings) {
        for (const beatType of ['accent', 'regular', 'subdivision']) {
          if (settings.soundSettings[beatType]) {
            metronome.setSoundSettings(beatType, settings.soundSettings[beatType]);
          }
        }
      }
      if (settings.theme) {
        applyTheme(settings.theme);
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

  // Populate secondary beats select (1-20, 0 = None already in HTML)
  for (let i = 1; i <= 20; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    secondaryBeatsSelect.appendChild(option);
  }

  // Set UI to match metronome state
  bpmValue.textContent = metronome.bpm;
  tempoSlider.value = metronome.bpm;
  beatsSelect.value = metronome.beatsPerMeasure;
  secondaryBeatsSelect.value = metronome.secondaryBeatsPerMeasure || 0;

  // Set volume sliders
  for (const type of ['beat', 'eighth', 'sixteenth', 'triplet']) {
    const volumePercent = Math.round(metronome.volumes[type] * 100);
    volumeSliders[type].value = volumePercent;
    volumeDisplays[type].textContent = `${volumePercent}%`;
  }

  // Create beat indicators
  updateBeatIndicators();
}

// Update beat indicators based on beats per measure
function updateBeatIndicators() {
  beatIndicators.innerHTML = '';

  // Primary measure indicators
  for (let i = 0; i < metronome.beatsPerMeasure; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'beat-indicator';
    indicator.dataset.beat = i;
    indicator.dataset.measure = 0;
    beatIndicators.appendChild(indicator);
  }

  // Secondary measure indicators (if set)
  if (metronome.secondaryBeatsPerMeasure !== null) {
    // Add separator
    const separator = document.createElement('div');
    separator.className = 'beat-separator';
    beatIndicators.appendChild(separator);

    for (let i = 0; i < metronome.secondaryBeatsPerMeasure; i++) {
      const indicator = document.createElement('div');
      indicator.className = 'beat-indicator';
      indicator.dataset.beat = i;
      indicator.dataset.measure = 1;
      beatIndicators.appendChild(indicator);
    }
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
  indicators.forEach((indicator) => {
    indicator.classList.remove('active', 'accent');
    const indicatorBeat = parseInt(indicator.dataset.beat, 10);
    const indicatorMeasure = parseInt(indicator.dataset.measure, 10);
    if (indicatorBeat === beatInfo.beat && indicatorMeasure === beatInfo.measure) {
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

tempoDown5.addEventListener('click', () => {
  const newBpm = Math.max(Metronome.MIN_BPM, metronome.bpm - 5);
  metronome.setTempo(newBpm);
  updateBpmDisplay();
  saveSettings();
});

tempoUp5.addEventListener('click', () => {
  const newBpm = Math.min(Metronome.MAX_BPM, metronome.bpm + 5);
  metronome.setTempo(newBpm);
  updateBpmDisplay();
  saveSettings();
});

beatsSelect.addEventListener('change', (e) => {
  const beats = parseInt(e.target.value, 10);
  metronome.setBeatsPerMeasure(beats);
  updateBeatIndicators();
  saveSettings();
});

secondaryBeatsSelect.addEventListener('change', (e) => {
  const beats = parseInt(e.target.value, 10);
  metronome.setSecondaryBeatsPerMeasure(beats === 0 ? null : beats);
  updateBeatIndicators();
  saveSettings();
});

// Volume slider event listeners
for (const type of ['beat', 'eighth', 'sixteenth', 'triplet']) {
  volumeSliders[type].addEventListener('input', (e) => {
    const volumePercent = parseInt(e.target.value, 10);
    metronome.setVolume(type, volumePercent / 100);
    volumeDisplays[type].textContent = `${volumePercent}%`;
    saveSettings();
  });
}

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
  themeSelect.value = currentTheme;
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
  metronome.resetVolumes();
  applyTheme('default');
  // Reset volume sliders in UI
  for (const type of ['beat', 'eighth', 'sixteenth', 'triplet']) {
    const defaultVolume = Metronome.DEFAULT_VOLUMES[type];
    volumeSliders[type].value = Math.round(defaultVolume * 100);
    volumeDisplays[type].textContent = `${Math.round(defaultVolume * 100)}%`;
  }
  updateSettingsUI();
  saveSettings();
});

themeSelect.addEventListener('change', (e) => {
  applyTheme(e.target.value);
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
