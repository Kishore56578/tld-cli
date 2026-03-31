import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setApiKey, getApiKey, setModel, getModel, handleConfig } from '../src/config.js';

vi.mock('conf', () => {
  let store = {};
  return {
    default: vi.fn().mockImplementation(() => ({
      get: (key, def) => store[key] !== undefined ? store[key] : def,
      set: (key, value) => { store[key] = value; },
      clear: () => { store = {}; }
    }))
  };
});

// Avoid console.log polluting the test output
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('TLD Coder Config Layer', () => {
    it('should securely store and retrieve an API Key', () => {
        const testKey = 'tld_live_test123';
        setApiKey(testKey);
        expect(getApiKey()).toBe(testKey);
    });

    it('should default to tld-ai-mini when no model is set', () => {
        // Assume store is clear
        expect(getModel()).toBe('tld-ai-mini');
    });

    it('should correctly update the preferred AI model', () => {
        setModel('claude-3-5-sonnet-20241022');
        expect(getModel()).toBe('claude-3-5-sonnet-20241022');
    });

    it('should parse the handleConfig actions properly', () => {
        handleConfig('set-key', 'mock_key_from_cli');
        expect(getApiKey()).toBe('mock_key_from_cli');
    });
});
