/**
 * Metronome class - Core logic for the Mr. Taps metronome
 */
export class Metronome {
  static MIN_BPM = 1;
  static MAX_BPM = 300;
  static MIN_BEATS = 1;
  static MAX_BEATS = 20;
  static SUBDIVISIONS = {
    NONE: 1,
    EIGHTH: 2,
    SIXTEENTH: 4,
    TRIPLET: 3,
  };

  constructor(audioContext = null) {
    this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.bpm = 120;
    this.beatsPerMeasure = 4;
    this.subdivision = Metronome.SUBDIVISIONS.NONE;
    this.isPlaying = false;
    this.currentBeat = 0;
    this.currentSubdivision = 0;
    this.nextNoteTime = 0;
    this.schedulerTimerId = null;
    this.scheduleAheadTime = 0.1; // seconds
    this.lookahead = 25; // milliseconds
    this.onBeat = null; // callback for UI updates
  }

  /**
   * Get the interval between beats in seconds
   */
  get beatInterval() {
    return 60.0 / this.bpm;
  }

  /**
   * Get the interval between subdivisions in seconds
   */
  get subdivisionInterval() {
    return this.beatInterval / this.subdivision;
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
   * Set the subdivision type
   * @param {number} subdivision - Subdivision value from Metronome.SUBDIVISIONS
   */
  setSubdivision(subdivision) {
    const validSubdivisions = Object.values(Metronome.SUBDIVISIONS);
    if (!validSubdivisions.includes(subdivision)) {
      throw new RangeError(`Invalid subdivision. Must be one of: ${validSubdivisions.join(', ')}`);
    }
    this.subdivision = subdivision;
  }

  /**
   * Play a beep sound at the specified time
   * @param {number} time - AudioContext time to play the sound
   * @param {boolean} isAccent - Whether this is an accented beat
   * @param {boolean} isSubdivision - Whether this is a subdivision beat
   */
  playBeep(time, isAccent = false, isSubdivision = false) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';

    // 440Hz for accents, 880Hz for regular beats, 660Hz for subdivisions
    if (isAccent) {
      oscillator.frequency.setValueAtTime(440, time);
      gainNode.gain.setValueAtTime(1.0, time);
    } else if (isSubdivision) {
      oscillator.frequency.setValueAtTime(660, time);
      gainNode.gain.setValueAtTime(0.3, time);
    } else {
      oscillator.frequency.setValueAtTime(880, time);
      gainNode.gain.setValueAtTime(0.7, time);
    }

    const duration = 0.05; // 50ms beep
    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  /**
   * Schedule the next note(s)
   */
  scheduleNote() {
    const isFirstBeat = this.currentBeat === 0;
    const isMainBeat = this.currentSubdivision === 0;

    if (isMainBeat) {
      this.playBeep(this.nextNoteTime, isFirstBeat, false);
    } else {
      this.playBeep(this.nextNoteTime, false, true);
    }

    // Trigger callback for UI updates
    if (this.onBeat) {
      this.onBeat({
        beat: this.currentBeat,
        subdivision: this.currentSubdivision,
        isAccent: isFirstBeat && isMainBeat,
      });
    }

    // Advance to next subdivision
    this.currentSubdivision++;
    if (this.currentSubdivision >= this.subdivision) {
      this.currentSubdivision = 0;
      this.currentBeat++;
      if (this.currentBeat >= this.beatsPerMeasure) {
        this.currentBeat = 0;
      }
    }

    this.nextNoteTime += this.subdivisionInterval;
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
    this.currentSubdivision = 0;
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
