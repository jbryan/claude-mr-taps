/**
 * Metronome class - Core logic for the Mr. Taps metronome
 */
export class Metronome {
  static MIN_BPM = 1;
  static MAX_BPM = 300;
  static MIN_BEATS = 1;
  static MAX_BEATS = 20;
  static DEFAULT_SUBDIVISION_VOLUMES = {
    eighth: 0,    // The "&" (50% through beat)
    sixteenth: 0, // The "e" and "a" (25% and 75% through beat)
    triplet: 0,   // Triplet subdivisions (33% and 66% through beat)
  };
  static WAVEFORMS = ['sine', 'square', 'triangle', 'sawtooth'];
  static DEFAULT_SOUND_SETTINGS = {
    accent: { pitch: 440, decay: 0.08, waveform: 'sine', gain: 1.0 },
    regular: { pitch: 880, decay: 0.08, waveform: 'sine', gain: 0.7 },
    subdivision: { pitch: 660, decay: 0.08, waveform: 'sine', gain: 0.3 },
  };

  constructor(audioContext = null) {
    this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.bpm = 120;
    this.beatsPerMeasure = 4;
    this.secondaryBeatsPerMeasure = null; // null = disabled, 1-20 = enabled
    this.subdivisionVolumes = { ...Metronome.DEFAULT_SUBDIVISION_VOLUMES };
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
   * Set the volume for a subdivision type
   * @param {string} type - 'eighth', 'sixteenth', or 'triplet'
   * @param {number} volume - Volume from 0 to 1
   */
  setSubdivisionVolume(type, volume) {
    if (!(type in this.subdivisionVolumes)) {
      throw new RangeError(`Invalid subdivision type: ${type}. Must be 'eighth', 'sixteenth', or 'triplet'`);
    }
    this.subdivisionVolumes[type] = Math.max(0, Math.min(1, volume));
  }

  /**
   * Reset subdivision volumes to defaults (all zero)
   */
  resetSubdivisionVolumes() {
    this.subdivisionVolumes = { ...Metronome.DEFAULT_SUBDIVISION_VOLUMES };
  }

  /**
   * Play a beep sound at the specified time
   * @param {number} time - AudioContext time to play the sound
   * @param {boolean} isAccent - Whether this is an accented beat
   * @param {boolean} isSubdivision - Whether this is a subdivision beat
   * @param {number} gainMultiplier - Multiplier for the gain (0-1), used for subdivision volumes
   */
  playBeep(time, isAccent = false, isSubdivision = false, gainMultiplier = 1) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Get settings based on beat type
    let settings;
    if (isAccent) {
      settings = this.soundSettings.accent;
    } else if (isSubdivision) {
      settings = this.soundSettings.subdivision;
    } else {
      settings = this.soundSettings.regular;
    }

    oscillator.type = settings.waveform;
    oscillator.frequency.setValueAtTime(settings.pitch, time);

    // Percussive envelope with quick attack and configurable decay
    const attackTime = 0.005; // 5ms attack
    const decayTime = settings.decay;
    const duration = attackTime + decayTime;

    // Apply gain multiplier to the final gain
    const finalGain = settings.gain * gainMultiplier;

    // Start at 0, quick attack to peak, then exponential decay
    gainNode.gain.setValueAtTime(0.001, time);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, finalGain), time + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration);
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
   * Schedule the next beat and all its subdivisions
   */
  scheduleNote() {
    const isFirstBeat = this.currentBeat === 0;
    const beatTime = this.nextNoteTime;
    const interval = this.beatInterval;

    // Play the main beat
    this.playBeep(beatTime, isFirstBeat, false);

    // Schedule eighth note subdivision (&) at 50% through the beat
    if (this.subdivisionVolumes.eighth > 0) {
      this.playBeep(beatTime + interval * 0.5, false, true, this.subdivisionVolumes.eighth);
    }

    // Schedule sixteenth note subdivisions (e and a) at 25% and 75% through the beat
    if (this.subdivisionVolumes.sixteenth > 0) {
      this.playBeep(beatTime + interval * 0.25, false, true, this.subdivisionVolumes.sixteenth);
      this.playBeep(beatTime + interval * 0.75, false, true, this.subdivisionVolumes.sixteenth);
    }

    // Schedule triplet subdivisions at 33% and 66% through the beat
    if (this.subdivisionVolumes.triplet > 0) {
      this.playBeep(beatTime + interval / 3, false, true, this.subdivisionVolumes.triplet);
      this.playBeep(beatTime + interval * 2 / 3, false, true, this.subdivisionVolumes.triplet);
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
