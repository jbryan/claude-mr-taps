/**
 * Metronome class - Core logic for the Mr. Taps metronome
 */
export class Metronome {
  static MIN_BPM = 1;
  static MAX_BPM = 300;
  static MIN_BEATS = 1;
  static MAX_BEATS = 20;
  static DEFAULT_VOLUMES = {
    beat: 1.0,    // Main beat volume
    eighth: 0,    // The "&" (50% through beat)
    sixteenth: 0, // The "e" and "a" (25% and 75% through beat)
    triplet: 0,   // Triplet subdivisions (33% and 66% through beat)
  };
  static WAVEFORMS = ['sine', 'square', 'triangle', 'sawtooth'];
  static DEFAULT_SOUND_SETTINGS = {
    accent: { pitch: 880, attack: 0.005, decay: 0.04, sustain: 0.5, release: 0.04, waveform: 'sine', gain: 1.0, noise: 0 },
    regular: { pitch: 440, attack: 0.005, decay: 0.04, sustain: 0.5, release: 0.04, waveform: 'sine', gain: 0.7, noise: 0 },
    subdivision: { pitch: 660, attack: 0.005, decay: 0.04, sustain: 0.5, release: 0.04, waveform: 'sine', gain: 0.3, noise: 0 },
  };
  static SOUND_PRESETS = {
    default: {
      name: 'Default',
      settings: {
        accent: { pitch: 880, attack: 0.005, decay: 0.04, sustain: 0.5, release: 0.04, waveform: 'sine', gain: 1.0, noise: 0 },
        regular: { pitch: 440, attack: 0.005, decay: 0.04, sustain: 0.5, release: 0.04, waveform: 'sine', gain: 0.7, noise: 0 },
        subdivision: { pitch: 660, attack: 0.005, decay: 0.04, sustain: 0.5, release: 0.04, waveform: 'sine', gain: 0.3, noise: 0 },
      },
    },
    click: {
      name: 'Click',
      settings: {
        accent: { pitch: 1500, attack: 0.001, decay: 0.02, sustain: 0, release: 0.01, waveform: 'square', gain: 1.0, noise: 0 },
        regular: { pitch: 1000, attack: 0.001, decay: 0.015, sustain: 0, release: 0.01, waveform: 'square', gain: 0.7, noise: 0 },
        subdivision: { pitch: 1200, attack: 0.001, decay: 0.01, sustain: 0, release: 0.005, waveform: 'square', gain: 0.3, noise: 0 },
      },
    },
    clave: {
      name: 'Clave',
      settings: {
        accent: { pitch: 1200, attack: 0.002, decay: 0.06, sustain: 0.2, release: 0.08, waveform: 'triangle', gain: 1.0, noise: 0 },
        regular: { pitch: 800, attack: 0.002, decay: 0.05, sustain: 0.15, release: 0.06, waveform: 'triangle', gain: 0.7, noise: 0 },
        subdivision: { pitch: 1000, attack: 0.002, decay: 0.04, sustain: 0.1, release: 0.04, waveform: 'triangle', gain: 0.3, noise: 0 },
      },
    },
    beep: {
      name: 'Beep',
      settings: {
        accent: { pitch: 1760, attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.05, waveform: 'sine', gain: 1.0, noise: 0 },
        regular: { pitch: 880, attack: 0.01, decay: 0.04, sustain: 0.7, release: 0.04, waveform: 'sine', gain: 0.7, noise: 0 },
        subdivision: { pitch: 1320, attack: 0.01, decay: 0.03, sustain: 0.6, release: 0.03, waveform: 'sine', gain: 0.3, noise: 0 },
      },
    },
    hihat: {
      name: 'Hi-Hat',
      settings: {
        // Open hi-hat for accent (longer decay), closed for regular
        accent: { pitch: 10000, attack: 0.001, decay: 0.08, sustain: 0, release: 0.05, waveform: 'square', gain: 0.8, noise: 0.9 },
        regular: { pitch: 8000, attack: 0.001, decay: 0.03, sustain: 0, release: 0.02, waveform: 'square', gain: 0.6, noise: 0.9 },
        subdivision: { pitch: 9000, attack: 0.001, decay: 0.02, sustain: 0, release: 0.015, waveform: 'square', gain: 0.3, noise: 0.9 },
      },
    },
    woodblock: {
      name: 'Woodblock',
      settings: {
        // Hollow, resonant wood tone with quick attack
        accent: { pitch: 900, attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.1, waveform: 'triangle', gain: 1.0, noise: 0.1 },
        regular: { pitch: 700, attack: 0.001, decay: 0.06, sustain: 0.1, release: 0.08, waveform: 'triangle', gain: 0.7, noise: 0.1 },
        subdivision: { pitch: 800, attack: 0.001, decay: 0.04, sustain: 0.05, release: 0.05, waveform: 'triangle', gain: 0.3, noise: 0.1 },
      },
    },
    snare: {
      name: 'Snare',
      settings: {
        // Punchy attack with noisy snare rattle
        accent: { pitch: 250, attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.15, waveform: 'triangle', gain: 1.0, noise: 0.7 },
        regular: { pitch: 200, attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.1, waveform: 'triangle', gain: 0.7, noise: 0.7 },
        subdivision: { pitch: 180, attack: 0.001, decay: 0.05, sustain: 0.05, release: 0.08, waveform: 'triangle', gain: 0.4, noise: 0.6 },
      },
    },
    tr808: {
      name: 'TR-808',
      settings: {
        // Classic analog drum machine - cowbell accent, toms for beats
        accent: { pitch: 800, attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.1, waveform: 'square', gain: 0.9, noise: 0 },
        regular: { pitch: 300, attack: 0.001, decay: 0.12, sustain: 0.2, release: 0.08, waveform: 'sine', gain: 0.8, noise: 0 },
        subdivision: { pitch: 500, attack: 0.001, decay: 0.06, sustain: 0.1, release: 0.05, waveform: 'sine', gain: 0.4, noise: 0 },
      },
    },
  };

  constructor(audioContext = null) {
    this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.bpm = 120;
    this.beatsPerMeasure = 4;
    this.secondaryBeatsPerMeasure = null; // null = disabled, 1-20 = enabled
    this.volumes = { ...Metronome.DEFAULT_VOLUMES };
    this.isPlaying = false;
    this.currentBeat = 0;
    this.currentMeasure = 0; // 0 = primary, 1 = secondary
    this.nextNoteTime = 0;
    this.schedulerTimerId = null;
    this.scheduleAheadTime = 0.1; // seconds
    this.lookahead = 25; // milliseconds
    this.onBeat = null; // callback for UI updates
    this.soundSettings = JSON.parse(JSON.stringify(Metronome.DEFAULT_SOUND_SETTINGS));
  }

  /**
   * Get the interval between beats in seconds
   */
  get beatInterval() {
    return 60.0 / this.bpm;
  }

  /**
   * Set the tempo (BPM)
   * @param {number} bpm - Beats per minute (1-300)
   */
  setTempo(bpm) {
    const tempo = Math.round(bpm);
    if (tempo < Metronome.MIN_BPM || tempo > Metronome.MAX_BPM) {
      throw new RangeError(`BPM must be between ${Metronome.MIN_BPM} and ${Metronome.MAX_BPM}`);
    }
    this.bpm = tempo;
  }

  /**
   * Set the number of beats per measure
   * @param {number} beats - Number of beats (1-20)
   */
  setBeatsPerMeasure(beats) {
    const numBeats = Math.round(beats);
    if (numBeats < Metronome.MIN_BEATS || numBeats > Metronome.MAX_BEATS) {
      throw new RangeError(`Beats per measure must be between ${Metronome.MIN_BEATS} and ${Metronome.MAX_BEATS}`);
    }
    this.beatsPerMeasure = numBeats;
  }

  /**
   * Set the secondary beats per measure (for compound time signatures)
   * @param {number|null} beats - Number of beats (1-20) or null to disable
   */
  setSecondaryBeatsPerMeasure(beats) {
    if (beats === null || beats === 0) {
      this.secondaryBeatsPerMeasure = null;
      // Reset to primary measure to avoid beat indicator mismatch
      this.currentMeasure = 0;
      this.currentBeat = 0;
      return;
    }
    const numBeats = Math.round(beats);
    if (numBeats < Metronome.MIN_BEATS || numBeats > Metronome.MAX_BEATS) {
      throw new RangeError(`Secondary beats per measure must be between ${Metronome.MIN_BEATS} and ${Metronome.MAX_BEATS}`);
    }
    this.secondaryBeatsPerMeasure = numBeats;
  }

  /**
   * Get the current active beats per measure based on which measure we're in
   * @returns {number} The beats for the current measure
   */
  get currentBeatsPerMeasure() {
    if (this.secondaryBeatsPerMeasure === null) {
      return this.beatsPerMeasure;
    }
    return this.currentMeasure === 0 ? this.beatsPerMeasure : this.secondaryBeatsPerMeasure;
  }

  /**
   * Set the volume for a specific type
   * @param {string} type - 'beat', 'eighth', 'sixteenth', or 'triplet'
   * @param {number} volume - Volume from 0 to 1
   */
  setVolume(type, volume) {
    if (!(type in this.volumes)) {
      throw new RangeError(`Invalid volume type: ${type}. Must be 'beat', 'eighth', 'sixteenth', or 'triplet'`);
    }
    this.volumes[type] = Math.max(0, Math.min(1, volume));
  }

  /**
   * Reset all volumes to defaults
   */
  resetVolumes() {
    this.volumes = { ...Metronome.DEFAULT_VOLUMES };
  }

  /**
   * Create a white noise buffer
   * @param {number} duration - Duration in seconds
   * @returns {AudioBuffer} White noise buffer
   */
  createNoiseBuffer(duration) {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = Math.ceil(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Play a beep sound at the specified time
   * @param {number} time - AudioContext time to play the sound
   * @param {boolean} isAccent - Whether this is an accented beat
   * @param {boolean} isSubdivision - Whether this is a subdivision beat
   * @param {number} gainMultiplier - Multiplier for the gain (0-1), used for subdivision volumes
   */
  playBeep(time, isAccent = false, isSubdivision = false, gainMultiplier = 1) {
    // Get settings based on beat type
    let settings;
    if (isAccent) {
      settings = this.soundSettings.accent;
    } else if (isSubdivision) {
      settings = this.soundSettings.subdivision;
    } else {
      settings = this.soundSettings.regular;
    }

    // ADSR envelope: Attack -> Decay -> Sustain level -> Release
    const attack = settings.attack || 0.005;
    const decay = settings.decay || 0.04;
    const sustain = settings.sustain !== undefined ? settings.sustain : 0.5;
    const release = settings.release || 0.04;
    const duration = attack + decay + release;

    // Apply gain multiplier to the final gain
    const finalGain = settings.gain * gainMultiplier;
    const sustainGain = Math.max(0.001, finalGain * sustain);

    // Noise amount (0-1), default to 0
    const noiseAmount = settings.noise || 0;
    const oscAmount = 1 - noiseAmount;

    // Create oscillator if there's any oscillator component
    if (oscAmount > 0) {
      const oscillator = this.audioContext.createOscillator();
      const oscGainNode = this.audioContext.createGain();

      oscillator.connect(oscGainNode);
      oscGainNode.connect(this.audioContext.destination);

      oscillator.type = settings.waveform;
      oscillator.frequency.setValueAtTime(settings.pitch, time);

      // ADSR envelope for oscillator
      const oscFinalGain = finalGain * oscAmount;
      const oscSustainGain = Math.max(0.001, oscFinalGain * sustain);

      oscGainNode.gain.setValueAtTime(0.001, time);
      oscGainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, oscFinalGain), time + attack);
      oscGainNode.gain.exponentialRampToValueAtTime(oscSustainGain, time + attack + decay);
      oscGainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

      oscillator.start(time);
      oscillator.stop(time + duration);
    }

    // Create noise if there's any noise component
    if (noiseAmount > 0) {
      const noiseBuffer = this.createNoiseBuffer(duration);
      const noiseSource = this.audioContext.createBufferSource();
      const noiseGainNode = this.audioContext.createGain();

      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseGainNode);
      noiseGainNode.connect(this.audioContext.destination);

      // ADSR envelope for noise
      const noiseFinalGain = finalGain * noiseAmount;
      const noiseSustainGain = Math.max(0.001, noiseFinalGain * sustain);

      noiseGainNode.gain.setValueAtTime(0.001, time);
      noiseGainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, noiseFinalGain), time + attack);
      noiseGainNode.gain.exponentialRampToValueAtTime(noiseSustainGain, time + attack + decay);
      noiseGainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noiseSource.start(time);
      noiseSource.stop(time + duration);
    }
  }

  /**
   * Update sound settings for a beat type
   * @param {string} beatType - 'accent', 'regular', or 'subdivision'
   * @param {object} settings - Object with pitch, decay, waveform, and/or gain
   */
  setSoundSettings(beatType, settings) {
    if (!this.soundSettings[beatType]) {
      throw new RangeError(`Invalid beat type: ${beatType}`);
    }
    Object.assign(this.soundSettings[beatType], settings);
  }

  /**
   * Reset sound settings to defaults
   */
  resetSoundSettings() {
    this.soundSettings = JSON.parse(JSON.stringify(Metronome.DEFAULT_SOUND_SETTINGS));
  }

  /**
   * Apply a sound preset
   * @param {string} presetName - Name of the preset ('default', 'click', 'clave', etc.)
   */
  applySoundPreset(presetName) {
    const preset = Metronome.SOUND_PRESETS[presetName];
    if (!preset) {
      throw new RangeError(`Invalid preset: ${presetName}`);
    }
    this.soundSettings = JSON.parse(JSON.stringify(preset.settings));
  }

  /**
   * Schedule the next beat and all its subdivisions
   */
  scheduleNote() {
    const isFirstBeat = this.currentBeat === 0;
    const beatTime = this.nextNoteTime;
    const interval = this.beatInterval;

    // Play the main beat
    if (this.volumes.beat > 0) {
      this.playBeep(beatTime, isFirstBeat, false, this.volumes.beat);
    }

    // Schedule eighth note subdivision (&) at 50% through the beat
    if (this.volumes.eighth > 0) {
      this.playBeep(beatTime + interval * 0.5, false, true, this.volumes.eighth);
    }

    // Schedule sixteenth note subdivisions (e and a) at 25% and 75% through the beat
    if (this.volumes.sixteenth > 0) {
      this.playBeep(beatTime + interval * 0.25, false, true, this.volumes.sixteenth);
      this.playBeep(beatTime + interval * 0.75, false, true, this.volumes.sixteenth);
    }

    // Schedule triplet subdivisions at 33% and 66% through the beat
    if (this.volumes.triplet > 0) {
      this.playBeep(beatTime + interval / 3, false, true, this.volumes.triplet);
      this.playBeep(beatTime + interval * 2 / 3, false, true, this.volumes.triplet);
    }

    // Trigger callback for UI updates
    if (this.onBeat) {
      this.onBeat({
        beat: this.currentBeat,
        isAccent: isFirstBeat,
        measure: this.currentMeasure,
      });
    }

    // Advance to next beat
    this.currentBeat++;
    if (this.currentBeat >= this.currentBeatsPerMeasure) {
      this.currentBeat = 0;
      // Alternate measures if secondary is set
      if (this.secondaryBeatsPerMeasure !== null) {
        this.currentMeasure = this.currentMeasure === 0 ? 1 : 0;
      }
    }

    this.nextNoteTime += interval;
  }

  /**
   * The scheduler that runs ahead and schedules notes
   */
  scheduler() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote();
    }
    this.schedulerTimerId = setTimeout(() => this.scheduler(), this.lookahead);
  }

  /**
   * Start the metronome
   */
  start() {
    if (this.isPlaying) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.currentBeat = 0;
    this.currentMeasure = 0;
    this.nextNoteTime = this.audioContext.currentTime;
    this.scheduler();
  }

  /**
   * Stop the metronome
   */
  stop() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    if (this.schedulerTimerId) {
      clearTimeout(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  /**
   * Toggle play/stop
   */
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}

export default Metronome;
