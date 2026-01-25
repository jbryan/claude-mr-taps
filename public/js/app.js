import { Metronome } from './metronome.js';

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

// Initialize metronome
const metronome = new Metronome();

// Initialize UI
function initUI() {
  // Populate beats select (1-20)
  for (let i = 1; i <= 20; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    if (i === 4) option.selected = true;
    beatsSelect.appendChild(option);
  }

  // Create beat indicators
  updateBeatIndicators();

  // Set initial values
  bpmValue.textContent = metronome.bpm;
  tempoSlider.value = metronome.bpm;
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
});

tempoDown.addEventListener('click', () => {
  if (metronome.bpm > Metronome.MIN_BPM) {
    metronome.setTempo(metronome.bpm - 1);
    updateBpmDisplay();
  }
});

tempoUp.addEventListener('click', () => {
  if (metronome.bpm < Metronome.MAX_BPM) {
    metronome.setTempo(metronome.bpm + 1);
    updateBpmDisplay();
  }
});

beatsSelect.addEventListener('change', (e) => {
  const beats = parseInt(e.target.value, 10);
  metronome.setBeatsPerMeasure(beats);
  updateBeatIndicators();
});

subdivisionSelect.addEventListener('change', (e) => {
  const subdivision = parseInt(e.target.value, 10);
  metronome.setSubdivision(subdivision);
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
  if (e.code === 'Space') {
    e.preventDefault();
    metronome.toggle();
    updatePlayButton(metronome.isPlaying);
    if (!metronome.isPlaying) {
      resetBeatIndicators();
    }
  }
});

// Set up beat callback
metronome.onBeat = highlightBeat;

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
