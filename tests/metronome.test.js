import { Metronome } from '../public/js/metronome.js';

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
      expect(metronome.volumes).toEqual({ beat: 1.0, eighth: 0, sixteenth: 0, triplet: 0 });
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

  describe('setSecondaryBeatsPerMeasure', () => {
    test('sets valid secondary beats', () => {
      metronome.setSecondaryBeatsPerMeasure(3);
      expect(metronome.secondaryBeatsPerMeasure).toBe(3);

      metronome.setSecondaryBeatsPerMeasure(7);
      expect(metronome.secondaryBeatsPerMeasure).toBe(7);
    });

    test('accepts minimum beats (1)', () => {
      metronome.setSecondaryBeatsPerMeasure(1);
      expect(metronome.secondaryBeatsPerMeasure).toBe(1);
    });

    test('accepts maximum beats (20)', () => {
      metronome.setSecondaryBeatsPerMeasure(20);
      expect(metronome.secondaryBeatsPerMeasure).toBe(20);
    });

    test('rounds floating point values', () => {
      metronome.setSecondaryBeatsPerMeasure(4.6);
      expect(metronome.secondaryBeatsPerMeasure).toBe(5);
    });

    test('sets null to disable', () => {
      metronome.setSecondaryBeatsPerMeasure(5);
      metronome.setSecondaryBeatsPerMeasure(null);
      expect(metronome.secondaryBeatsPerMeasure).toBe(null);
    });

    test('sets 0 to disable', () => {
      metronome.setSecondaryBeatsPerMeasure(5);
      metronome.setSecondaryBeatsPerMeasure(0);
      expect(metronome.secondaryBeatsPerMeasure).toBe(null);
    });

    test('resets currentMeasure and currentBeat when disabled', () => {
      metronome.setSecondaryBeatsPerMeasure(4);
      metronome.currentMeasure = 1;
      metronome.currentBeat = 3;
      metronome.setSecondaryBeatsPerMeasure(null);
      expect(metronome.currentMeasure).toBe(0);
      expect(metronome.currentBeat).toBe(0);
    });

    test('throws error for beats below minimum', () => {
      expect(() => metronome.setSecondaryBeatsPerMeasure(-1)).toThrow(RangeError);
    });

    test('throws error for beats above maximum', () => {
      expect(() => metronome.setSecondaryBeatsPerMeasure(21)).toThrow(RangeError);
      expect(() => metronome.setSecondaryBeatsPerMeasure(100)).toThrow(RangeError);
    });
  });

  describe('currentBeatsPerMeasure', () => {
    test('returns primary beats when secondary is null', () => {
      metronome.setBeatsPerMeasure(4);
      expect(metronome.currentBeatsPerMeasure).toBe(4);
    });

    test('returns primary beats when in measure 0', () => {
      metronome.setBeatsPerMeasure(3);
      metronome.setSecondaryBeatsPerMeasure(4);
      metronome.currentMeasure = 0;
      expect(metronome.currentBeatsPerMeasure).toBe(3);
    });

    test('returns secondary beats when in measure 1', () => {
      metronome.setBeatsPerMeasure(3);
      metronome.setSecondaryBeatsPerMeasure(4);
      metronome.currentMeasure = 1;
      expect(metronome.currentBeatsPerMeasure).toBe(4);
    });
  });

  describe('setVolume', () => {
    test('sets valid volumes', () => {
      metronome.setVolume('beat', 0.5);
      expect(metronome.volumes.beat).toBe(0.5);

      metronome.setVolume('eighth', 0.5);
      expect(metronome.volumes.eighth).toBe(0.5);

      metronome.setVolume('sixteenth', 0.75);
      expect(metronome.volumes.sixteenth).toBe(0.75);

      metronome.setVolume('triplet', 1.0);
      expect(metronome.volumes.triplet).toBe(1.0);
    });

    test('clamps volume to 0-1 range', () => {
      metronome.setVolume('eighth', 1.5);
      expect(metronome.volumes.eighth).toBe(1);

      metronome.setVolume('eighth', -0.5);
      expect(metronome.volumes.eighth).toBe(0);
    });

    test('throws error for invalid volume type', () => {
      expect(() => metronome.setVolume('invalid', 0.5)).toThrow(RangeError);
    });

    test('resetVolumes restores defaults', () => {
      metronome.setVolume('beat', 0.5);
      metronome.setVolume('eighth', 0.8);
      metronome.setVolume('sixteenth', 0.6);
      metronome.setVolume('triplet', 0.4);
      metronome.resetVolumes();
      expect(metronome.volumes).toEqual({ beat: 1.0, eighth: 0, sixteenth: 0, triplet: 0 });
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
        expect(info).toHaveProperty('isAccent');
        expect(info).toHaveProperty('measure');
        metronome.stop();
        done();
      };
      metronome.start();
    });

    test('first beat is accented', (done) => {
      metronome.setTempo(300);
      metronome.onBeat = (info) => {
        if (info.beat === 0) {
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

    test('DEFAULT_VOLUMES has correct values', () => {
      expect(Metronome.DEFAULT_VOLUMES.beat).toBe(1.0);
      expect(Metronome.DEFAULT_VOLUMES.eighth).toBe(0);
      expect(Metronome.DEFAULT_VOLUMES.sixteenth).toBe(0);
      expect(Metronome.DEFAULT_VOLUMES.triplet).toBe(0);
    });

    test('WAVEFORMS has correct values', () => {
      expect(Metronome.WAVEFORMS).toContain('sine');
      expect(Metronome.WAVEFORMS).toContain('square');
      expect(Metronome.WAVEFORMS).toContain('triangle');
      expect(Metronome.WAVEFORMS).toContain('sawtooth');
    });

    test('DEFAULT_SOUND_SETTINGS has all beat types', () => {
      expect(Metronome.DEFAULT_SOUND_SETTINGS).toHaveProperty('accent');
      expect(Metronome.DEFAULT_SOUND_SETTINGS).toHaveProperty('regular');
      expect(Metronome.DEFAULT_SOUND_SETTINGS).toHaveProperty('subdivision');
    });
  });

  describe('playBeep', () => {
    test('plays accent beat without throwing', () => {
      expect(() => metronome.playBeep(0, true, false)).not.toThrow();
    });

    test('plays regular beat without throwing', () => {
      expect(() => metronome.playBeep(0, false, false)).not.toThrow();
    });

    test('plays subdivision beat without throwing', () => {
      expect(() => metronome.playBeep(0, false, true)).not.toThrow();
    });

    test('applies gain multiplier without throwing', () => {
      expect(() => metronome.playBeep(0, false, false, 0.5)).not.toThrow();
    });

    test('handles very low gain multiplier', () => {
      expect(() => metronome.playBeep(0, false, false, 0.001)).not.toThrow();
    });
  });

  describe('scheduleNote with subdivisions', () => {
    test('schedules eighth note subdivisions when volume > 0', () => {
      metronome.setVolume('eighth', 0.5);
      expect(() => metronome.scheduleNote()).not.toThrow();
    });

    test('schedules sixteenth note subdivisions when volume > 0', () => {
      metronome.setVolume('sixteenth', 0.5);
      expect(() => metronome.scheduleNote()).not.toThrow();
    });

    test('schedules triplet subdivisions when volume > 0', () => {
      metronome.setVolume('triplet', 0.5);
      expect(() => metronome.scheduleNote()).not.toThrow();
    });

    test('handles all subdivisions enabled at once', () => {
      metronome.setVolume('eighth', 0.5);
      metronome.setVolume('sixteenth', 0.5);
      metronome.setVolume('triplet', 0.5);
      expect(() => metronome.scheduleNote()).not.toThrow();
    });

    test('does not throw when beat volume is 0', () => {
      metronome.setVolume('beat', 0);
      expect(() => metronome.scheduleNote()).not.toThrow();
    });

    test('alternates measures when secondary beats is set', () => {
      metronome.setBeatsPerMeasure(2);
      metronome.setSecondaryBeatsPerMeasure(3);

      // Manually simulate beats to test alternation
      metronome.currentBeat = 0;
      metronome.currentMeasure = 0;

      // First beat
      metronome.scheduleNote();
      expect(metronome.currentBeat).toBe(1);
      expect(metronome.currentMeasure).toBe(0);

      // Second beat (end of first measure)
      metronome.scheduleNote();
      expect(metronome.currentBeat).toBe(0);
      expect(metronome.currentMeasure).toBe(1); // Should switch to secondary

      // Continue through secondary measure (3 beats)
      metronome.scheduleNote(); // beat 1
      metronome.scheduleNote(); // beat 2
      metronome.scheduleNote(); // beat 3 -> wraps
      expect(metronome.currentBeat).toBe(0);
      expect(metronome.currentMeasure).toBe(0); // Should switch back to primary
    });
  });

  describe('audioContext state', () => {
    test('handles suspended audioContext on start', () => {
      const suspendedContext = new AudioContext();
      suspendedContext.state = 'suspended';

      const testMetronome = new Metronome(suspendedContext);
      expect(() => testMetronome.start()).not.toThrow();
      testMetronome.stop();
    });
  });

  describe('soundSettings', () => {
    test('initializes with default sound settings', () => {
      expect(metronome.soundSettings.accent.pitch).toBe(440);
      expect(metronome.soundSettings.regular.pitch).toBe(880);
      expect(metronome.soundSettings.subdivision.pitch).toBe(660);
    });

    test('setSoundSettings updates pitch', () => {
      metronome.setSoundSettings('accent', { pitch: 500 });
      expect(metronome.soundSettings.accent.pitch).toBe(500);
    });

    test('setSoundSettings updates decay', () => {
      metronome.setSoundSettings('regular', { decay: 0.1 });
      expect(metronome.soundSettings.regular.decay).toBe(0.1);
    });

    test('setSoundSettings updates waveform', () => {
      metronome.setSoundSettings('subdivision', { waveform: 'square' });
      expect(metronome.soundSettings.subdivision.waveform).toBe('square');
    });

    test('setSoundSettings updates multiple properties', () => {
      metronome.setSoundSettings('accent', { pitch: 600, decay: 0.15, waveform: 'triangle' });
      expect(metronome.soundSettings.accent.pitch).toBe(600);
      expect(metronome.soundSettings.accent.decay).toBe(0.15);
      expect(metronome.soundSettings.accent.waveform).toBe('triangle');
    });

    test('setSoundSettings throws for invalid beat type', () => {
      expect(() => metronome.setSoundSettings('invalid', { pitch: 440 })).toThrow(RangeError);
    });

    test('resetSoundSettings restores defaults', () => {
      metronome.setSoundSettings('accent', { pitch: 1000, decay: 0.2, waveform: 'sawtooth' });
      metronome.resetSoundSettings();
      expect(metronome.soundSettings.accent.pitch).toBe(440);
      expect(metronome.soundSettings.accent.decay).toBe(0.08);
      expect(metronome.soundSettings.accent.waveform).toBe('sine');
    });

    test('sound settings are independent between instances', () => {
      const metronome2 = new Metronome();
      metronome.setSoundSettings('accent', { pitch: 1000 });
      expect(metronome2.soundSettings.accent.pitch).toBe(440);
    });
  });
});
