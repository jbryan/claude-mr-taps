import { Metronome } from '../src/js/metronome.js';

describe('Metronome', () => {
  let metronome;

  beforeEach(() => {
    metronome = new Metronome();
  });

  afterEach(() => {
    metronome.stop();
  });

  describe('constructor', () => {
    test('initializes with default values', () => {
      expect(metronome.bpm).toBe(120);
      expect(metronome.beatsPerMeasure).toBe(4);
      expect(metronome.subdivision).toBe(Metronome.SUBDIVISIONS.NONE);
      expect(metronome.isPlaying).toBe(false);
    });

    test('accepts custom AudioContext', () => {
      const customContext = new AudioContext();
      const customMetronome = new Metronome(customContext);
      expect(customMetronome.audioContext).toBe(customContext);
    });
  });

  describe('setTempo', () => {
    test('sets valid BPM', () => {
      metronome.setTempo(60);
      expect(metronome.bpm).toBe(60);

      metronome.setTempo(180);
      expect(metronome.bpm).toBe(180);
    });

    test('accepts minimum BPM (1)', () => {
      metronome.setTempo(1);
      expect(metronome.bpm).toBe(1);
    });

    test('accepts maximum BPM (300)', () => {
      metronome.setTempo(300);
      expect(metronome.bpm).toBe(300);
    });

    test('rounds floating point BPM', () => {
      metronome.setTempo(120.7);
      expect(metronome.bpm).toBe(121);

      metronome.setTempo(120.3);
      expect(metronome.bpm).toBe(120);
    });

    test('throws error for BPM below minimum', () => {
      expect(() => metronome.setTempo(0)).toThrow(RangeError);
      expect(() => metronome.setTempo(-1)).toThrow(RangeError);
    });

    test('throws error for BPM above maximum', () => {
      expect(() => metronome.setTempo(301)).toThrow(RangeError);
      expect(() => metronome.setTempo(500)).toThrow(RangeError);
    });
  });

  describe('setBeatsPerMeasure', () => {
    test('sets valid beats per measure', () => {
      metronome.setBeatsPerMeasure(3);
      expect(metronome.beatsPerMeasure).toBe(3);

      metronome.setBeatsPerMeasure(7);
      expect(metronome.beatsPerMeasure).toBe(7);
    });

    test('accepts minimum beats (1)', () => {
      metronome.setBeatsPerMeasure(1);
      expect(metronome.beatsPerMeasure).toBe(1);
    });

    test('accepts maximum beats (20)', () => {
      metronome.setBeatsPerMeasure(20);
      expect(metronome.beatsPerMeasure).toBe(20);
    });

    test('rounds floating point values', () => {
      metronome.setBeatsPerMeasure(4.6);
      expect(metronome.beatsPerMeasure).toBe(5);
    });

    test('throws error for beats below minimum', () => {
      expect(() => metronome.setBeatsPerMeasure(0)).toThrow(RangeError);
      expect(() => metronome.setBeatsPerMeasure(-1)).toThrow(RangeError);
    });

    test('throws error for beats above maximum', () => {
      expect(() => metronome.setBeatsPerMeasure(21)).toThrow(RangeError);
      expect(() => metronome.setBeatsPerMeasure(100)).toThrow(RangeError);
    });
  });

  describe('setSubdivision', () => {
    test('sets valid subdivisions', () => {
      metronome.setSubdivision(Metronome.SUBDIVISIONS.NONE);
      expect(metronome.subdivision).toBe(1);

      metronome.setSubdivision(Metronome.SUBDIVISIONS.EIGHTH);
      expect(metronome.subdivision).toBe(2);

      metronome.setSubdivision(Metronome.SUBDIVISIONS.SIXTEENTH);
      expect(metronome.subdivision).toBe(4);

      metronome.setSubdivision(Metronome.SUBDIVISIONS.TRIPLET);
      expect(metronome.subdivision).toBe(3);
    });

    test('throws error for invalid subdivision', () => {
      expect(() => metronome.setSubdivision(5)).toThrow(RangeError);
      expect(() => metronome.setSubdivision(0)).toThrow(RangeError);
      expect(() => metronome.setSubdivision(-1)).toThrow(RangeError);
    });
  });

  describe('beatInterval', () => {
    test('calculates correct interval for 60 BPM', () => {
      metronome.setTempo(60);
      expect(metronome.beatInterval).toBe(1.0); // 1 second
    });

    test('calculates correct interval for 120 BPM', () => {
      metronome.setTempo(120);
      expect(metronome.beatInterval).toBe(0.5); // 0.5 seconds
    });

    test('calculates correct interval for 240 BPM', () => {
      metronome.setTempo(240);
      expect(metronome.beatInterval).toBe(0.25); // 0.25 seconds
    });
  });

  describe('subdivisionInterval', () => {
    test('equals beat interval when no subdivision', () => {
      metronome.setTempo(120);
      metronome.setSubdivision(Metronome.SUBDIVISIONS.NONE);
      expect(metronome.subdivisionInterval).toBe(0.5);
    });

    test('calculates correct interval for eighth notes', () => {
      metronome.setTempo(120);
      metronome.setSubdivision(Metronome.SUBDIVISIONS.EIGHTH);
      expect(metronome.subdivisionInterval).toBe(0.25);
    });

    test('calculates correct interval for sixteenth notes', () => {
      metronome.setTempo(120);
      metronome.setSubdivision(Metronome.SUBDIVISIONS.SIXTEENTH);
      expect(metronome.subdivisionInterval).toBe(0.125);
    });

    test('calculates correct interval for triplets', () => {
      metronome.setTempo(120);
      metronome.setSubdivision(Metronome.SUBDIVISIONS.TRIPLET);
      expect(metronome.subdivisionInterval).toBeCloseTo(0.5 / 3);
    });
  });

  describe('start/stop', () => {
    test('start sets isPlaying to true', () => {
      metronome.start();
      expect(metronome.isPlaying).toBe(true);
    });

    test('stop sets isPlaying to false', () => {
      metronome.start();
      metronome.stop();
      expect(metronome.isPlaying).toBe(false);
    });

    test('start resets beat counter to beginning of measure', () => {
      metronome.currentBeat = 3;
      metronome.currentSubdivision = 2;
      metronome.start();
      // After start, scheduler runs immediately and advances one beat
      // So we check that it didn't continue from beat 3
      expect(metronome.currentBeat).toBeLessThan(3);
    });

    test('calling start twice does not restart', () => {
      metronome.start();
      const firstNextNoteTime = metronome.nextNoteTime;
      metronome.start();
      expect(metronome.nextNoteTime).toBe(firstNextNoteTime);
    });

    test('calling stop twice is safe', () => {
      metronome.stop();
      expect(() => metronome.stop()).not.toThrow();
    });
  });

  describe('toggle', () => {
    test('starts when stopped', () => {
      expect(metronome.isPlaying).toBe(false);
      metronome.toggle();
      expect(metronome.isPlaying).toBe(true);
    });

    test('stops when playing', () => {
      metronome.start();
      expect(metronome.isPlaying).toBe(true);
      metronome.toggle();
      expect(metronome.isPlaying).toBe(false);
    });
  });

  describe('onBeat callback', () => {
    test('callback is called with beat info', (done) => {
      metronome.setTempo(300); // Fast tempo for quick test
      metronome.onBeat = (info) => {
        expect(info).toHaveProperty('beat');
        expect(info).toHaveProperty('subdivision');
        expect(info).toHaveProperty('isAccent');
        metronome.stop();
        done();
      };
      metronome.start();
    });

    test('first beat is accented', (done) => {
      metronome.setTempo(300);
      metronome.onBeat = (info) => {
        if (info.beat === 0 && info.subdivision === 0) {
          expect(info.isAccent).toBe(true);
          metronome.stop();
          done();
        }
      };
      metronome.start();
    });
  });

  describe('static constants', () => {
    test('MIN_BPM is 1', () => {
      expect(Metronome.MIN_BPM).toBe(1);
    });

    test('MAX_BPM is 300', () => {
      expect(Metronome.MAX_BPM).toBe(300);
    });

    test('MIN_BEATS is 1', () => {
      expect(Metronome.MIN_BEATS).toBe(1);
    });

    test('MAX_BEATS is 20', () => {
      expect(Metronome.MAX_BEATS).toBe(20);
    });

    test('SUBDIVISIONS has correct values', () => {
      expect(Metronome.SUBDIVISIONS.NONE).toBe(1);
      expect(Metronome.SUBDIVISIONS.EIGHTH).toBe(2);
      expect(Metronome.SUBDIVISIONS.SIXTEENTH).toBe(4);
      expect(Metronome.SUBDIVISIONS.TRIPLET).toBe(3);
    });
  });
});
