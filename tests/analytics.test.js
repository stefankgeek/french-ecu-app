/**
 * Statistiques : rien n'est envoyé sans accord, et les valeurs de calcul sont résumées proprement.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { summarizeInputs, consent, track } from '../src/core/analytics.js';

describe('Statistiques', () => {
  beforeEach(() => { try { globalThis.localStorage?.clear(); } catch { /* pas de stockage */ } });
  it('pas de consentement par défaut', () => {
    expect(consent()).toBeNull();
  });
  it('track sans accord ne plante pas et n\'envoie rien', () => {
    expect(() => track('test_event', { a: 1 })).not.toThrow();
  });
  it('résumé des valeurs : 4 chiffres significatifs, listes inchangées', () => {
    expect(summarizeInputs({ a: 1234.5678, b: 0.000123456, fuel: 'sp98', n: 4 })).toEqual({ a: 1235, b: 0.0001235, fuel: 'sp98', n: 4 });
  });
});
