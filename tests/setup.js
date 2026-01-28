import { jest } from '@jest/globals';

// Mock Web Audio API for testing
class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'running';
    this.destination = {};
    this.sampleRate = 44100;
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: jest.fn(), value: 440 },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        value: 1,
      },
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  createBuffer(channels, length, sampleRate) {
    const data = new Float32Array(length);
    return {
      numberOfChannels: channels,
      length: length,
      sampleRate: sampleRate,
      getChannelData: () => data,
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
}

global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;
