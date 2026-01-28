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
const tapTempoBtn = document.getElementById('tap-tempo');
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
const soundPresetSelect = document.getElementById('sound-preset');

// Info Dialog Elements
const infoBtn = document.getElementById('info-btn');
const infoDialog = document.getElementById('info-dialog');
const infoClose = document.getElementById('info-close');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Sound setting inputs
const soundInputs = {
  accent: {
    pitch: document.getElementById('accent-pitch'),
    attack: document.getElementById('accent-attack'),
    decay: document.getElementById('accent-decay'),
    sustain: document.getElementById('accent-sustain'),
    release: document.getElementById('accent-release'),
    waveform: document.getElementById('accent-waveform'),
    noise: document.getElementById('accent-noise'),
  },
  regular: {
    pitch: document.getElementById('regular-pitch'),
    attack: document.getElementById('regular-attack'),
    decay: document.getElementById('regular-decay'),
    sustain: document.getElementById('regular-sustain'),
    release: document.getElementById('regular-release'),
    waveform: document.getElementById('regular-waveform'),
    noise: document.getElementById('regular-noise'),
  },
  subdivision: {
    pitch: document.getElementById('subdivision-pitch'),
    attack: document.getElementById('subdivision-attack'),
    decay: document.getElementById('subdivision-decay'),
    sustain: document.getElementById('subdivision-sustain'),
    release: document.getElementById('subdivision-release'),
    waveform: document.getElementById('subdivision-waveform'),
    noise: document.getElementById('subdivision-noise'),
  },
};

// Initialize metronome
const metronome = new Metronome();

// Current theme
let currentTheme = 'default';

// Current sound preset
let currentSoundPreset = 'default';

// Tap tempo state
const tapTimes = [];
const TAP_TIMEOUT = 2000; // Reset after 2 seconds of no taps
const TAP_SAMPLES = 4; // Number of taps to average

// Calculate BPM from tap times
function calculateTapTempo() {
  if (tapTimes.length < 2) return null;

  // Calculate intervals between taps
  const intervals = [];
  for (let i = 1; i < tapTimes.length; i++) {
    intervals.push(tapTimes[i] - tapTimes[i - 1]);
  }

  // Calculate average interval
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Convert to BPM (60000ms = 1 minute)
  const bpm = Math.round(60000 / avgInterval);

  // Clamp to valid range
  return Math.max(Metronome.MIN_BPM, Math.min(Metronome.MAX_BPM, bpm));
}

// Handle tap tempo
function handleTapTempo() {
  const now = Date.now();

  // Reset if too long since last tap
  if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > TAP_TIMEOUT) {
    tapTimes.length = 0;
  }

  // Add current tap time
  tapTimes.push(now);

  // Keep only recent taps
  while (tapTimes.length > TAP_SAMPLES) {
    tapTimes.shift();
  }

  // Calculate and apply tempo
  const bpm = calculateTapTempo();
  if (bpm !== null) {
    metronome.setTempo(bpm);
    updateBpmDisplay();
    saveSettings();
  }

  // Visual feedback
  tapTempoBtn.classList.add('active');
  setTimeout(() => tapTempoBtn.classList.remove('active'), 100);
}

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
    soundPreset: currentSoundPreset,
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
      if (settings.soundPreset) {
        currentSoundPreset = settings.soundPreset;
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

// Add scroll wheel support to a range input
function addWheelSupport(slider, step = 1) {
  slider.addEventListener('wheel', (e) => {
    e.preventDefault();
    const min = parseInt(slider.min, 10) || 0;
    const max = parseInt(slider.max, 10) || 100;
    const currentValue = parseInt(slider.value, 10);
    const delta = e.deltaY < 0 ? step : -step;
    const newValue = Math.max(min, Math.min(max, currentValue + delta));
    if (newValue !== currentValue) {
      slider.value = newValue;
      slider.dispatchEvent(new Event('input'));
    }
  }, { passive: false });
}

// Add wheel support to all sliders
addWheelSupport(tempoSlider, 1);
for (const type of ['beat', 'eighth', 'sixteenth', 'triplet']) {
  addWheelSupport(volumeSliders[type], 5);
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

tapTempoBtn.addEventListener('click', handleTapTempo);

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
  if (e.code === 'Space' && !settingsDialog.open && !infoDialog.open) {
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
  if (e.code === 'Escape' && infoDialog.open) {
    infoDialog.close();
  }
});

// Set up beat callback
metronome.onBeat = highlightBeat;

// Settings Dialog Functions
function updateSettingsUI() {
  themeSelect.value = currentTheme;
  soundPresetSelect.value = currentSoundPreset;
  const settings = metronome.soundSettings;
  for (const beatType of ['accent', 'regular', 'subdivision']) {
    soundInputs[beatType].pitch.value = settings[beatType].pitch;
    soundInputs[beatType].attack.value = Math.round((settings[beatType].attack || 0.005) * 1000);
    soundInputs[beatType].decay.value = Math.round((settings[beatType].decay || 0.04) * 1000);
    soundInputs[beatType].sustain.value = Math.round((settings[beatType].sustain !== undefined ? settings[beatType].sustain : 0.5) * 100);
    soundInputs[beatType].release.value = Math.round((settings[beatType].release || 0.04) * 1000);
    soundInputs[beatType].waveform.value = settings[beatType].waveform;
    soundInputs[beatType].noise.value = Math.round((settings[beatType].noise || 0) * 100);
  }
}

function applySoundPreset(presetName) {
  metronome.applySoundPreset(presetName);
  currentSoundPreset = presetName;
  updateSettingsUI();
  saveSettings();
}

function applySoundSetting(beatType, setting, value) {
  if (setting === 'attack' || setting === 'decay' || setting === 'release') {
    // Convert ms to seconds
    metronome.setSoundSettings(beatType, { [setting]: value / 1000 });
  } else if (setting === 'sustain' || setting === 'noise') {
    // Convert percentage (0-100) to ratio (0-1)
    metronome.setSoundSettings(beatType, { [setting]: value / 100 });
  } else {
    metronome.setSoundSettings(beatType, { [setting]: value });
  }
  // Mark as custom preset when manually changing settings
  currentSoundPreset = 'custom';
  soundPresetSelect.value = 'custom';
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
  currentSoundPreset = 'default';
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

soundPresetSelect.addEventListener('change', (e) => {
  if (e.target.value !== 'custom') {
    applySoundPreset(e.target.value);
  }
});

// Add event listeners for all sound setting inputs
for (const beatType of ['accent', 'regular', 'subdivision']) {
  soundInputs[beatType].pitch.addEventListener('change', (e) => {
    const value = Math.max(100, Math.min(12000, parseInt(e.target.value, 10) || 440));
    e.target.value = value;
    applySoundSetting(beatType, 'pitch', value);
  });

  soundInputs[beatType].attack.addEventListener('change', (e) => {
    const parsed = parseInt(e.target.value, 10);
    const value = Math.max(1, Math.min(100, isNaN(parsed) ? 5 : parsed));
    e.target.value = value;
    applySoundSetting(beatType, 'attack', value);
  });

  soundInputs[beatType].decay.addEventListener('change', (e) => {
    const parsed = parseInt(e.target.value, 10);
    const value = Math.max(10, Math.min(500, isNaN(parsed) ? 40 : parsed));
    e.target.value = value;
    applySoundSetting(beatType, 'decay', value);
  });

  soundInputs[beatType].sustain.addEventListener('change', (e) => {
    const parsed = parseInt(e.target.value, 10);
    const value = Math.max(0, Math.min(100, isNaN(parsed) ? 50 : parsed));
    e.target.value = value;
    applySoundSetting(beatType, 'sustain', value);
  });

  soundInputs[beatType].release.addEventListener('change', (e) => {
    const parsed = parseInt(e.target.value, 10);
    const value = Math.max(1, Math.min(500, isNaN(parsed) ? 40 : parsed));
    e.target.value = value;
    applySoundSetting(beatType, 'release', value);
  });

  soundInputs[beatType].waveform.addEventListener('change', (e) => {
    applySoundSetting(beatType, 'waveform', e.target.value);
  });

  soundInputs[beatType].noise.addEventListener('change', (e) => {
    const parsed = parseInt(e.target.value, 10);
    const value = Math.max(0, Math.min(100, isNaN(parsed) ? 0 : parsed));
    e.target.value = value;
    applySoundSetting(beatType, 'noise', value);
  });
}

// Info Dialog Elements for dynamic content
const appVersionSpan = document.getElementById('app-version');
const changelogPanel = document.getElementById('tab-changelog');

// Cache for loaded content
let versionLoaded = false;
let changelogLoaded = false;

// Load version from version.json
async function loadVersion() {
  if (versionLoaded) return;
  try {
    const response = await fetch('./version.json');
    if (response.ok) {
      const data = await response.json();
      if (appVersionSpan) {
        appVersionSpan.textContent = data.version;
      }
      versionLoaded = true;
    }
  } catch (e) {
    console.warn('Could not load version:', e);
  }
}

// Parse changelog markdown to HTML
function parseChangelog(markdown) {
  const lines = markdown.split('\n');
  let html = '';
  let inList = false;
  let inEntry = false;

  for (const line of lines) {
    // Skip the main title and description
    if (line.startsWith('# ') || line.startsWith('All notable')) {
      continue;
    }

    // Version header (## [version] - date)
    const versionMatch = line.match(/^## \[([^\]]+)\]/);
    if (versionMatch) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (inEntry) {
        html += '</div>';
      }
      html += `<div class="changelog-entry"><h4>${versionMatch[1]}</h4>`;
      inEntry = true;
      continue;
    }

    // Section header (### Added, ### Changed, etc.)
    if (line.startsWith('### ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue; // Skip section headers, just show the items
    }

    // List item
    if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      const content = line.substring(2).replace(/`([^`]+)`/g, '<code>$1</code>');
      html += `<li>${content}</li>`;
      continue;
    }

    // Nested list item (indented)
    if (line.startsWith('  - ')) {
      const content = line.substring(4).replace(/`([^`]+)`/g, '<code>$1</code>');
      html += `<li style="margin-left: 15px;">${content}</li>`;
      continue;
    }
  }

  if (inList) {
    html += '</ul>';
  }
  if (inEntry) {
    html += '</div>';
  }

  return html;
}

// Load changelog from CHANGELOG.md
async function loadChangelog() {
  if (changelogLoaded) return;
  try {
    const response = await fetch('./CHANGELOG.md');
    if (response.ok) {
      const markdown = await response.text();
      if (changelogPanel) {
        changelogPanel.innerHTML = parseChangelog(markdown);
      }
      changelogLoaded = true;
    }
  } catch (e) {
    console.warn('Could not load changelog:', e);
  }
}

// Info Dialog Event Listeners
infoBtn.addEventListener('click', async () => {
  // Load dynamic content
  await Promise.all([loadVersion(), loadChangelog()]);
  infoDialog.showModal();
});

infoClose.addEventListener('click', () => {
  infoDialog.close();
});

infoDialog.addEventListener('click', (e) => {
  // Close when clicking backdrop
  if (e.target === infoDialog) {
    infoDialog.close();
  }
});

// Tab switching
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    // Update button states
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // Update panel visibility
    tabPanels.forEach((panel) => {
      panel.classList.remove('active');
      if (panel.id === `tab-${tabName}`) {
        panel.classList.add('active');
      }
    });
  });
});

// Update banner elements
const updateBanner = document.getElementById('update-banner');
const updateBtn = document.getElementById('update-btn');

// Track waiting service worker
let newWorker = null;

// Show update banner
function showUpdateBanner() {
  if (updateBanner) {
    updateBanner.classList.remove('hidden');
  }
}

// Handle update button click
if (updateBtn) {
  updateBtn.addEventListener('click', () => {
    if (newWorker) {
      // Tell the waiting service worker to skip waiting
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}

// Register service worker and handle updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(
      (registration) => {
        console.log('ServiceWorker registered:', registration.scope);

        // Check if there's already a waiting worker
        if (registration.waiting) {
          newWorker = registration.waiting;
          showUpdateBanner();
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                newWorker = installingWorker;
                showUpdateBanner();
              }
            });
          }
        });
      },
      (error) => {
        console.log('ServiceWorker registration failed:', error);
      }
    );

    // Reload page when new service worker takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}

// Initialize the app
initUI();
