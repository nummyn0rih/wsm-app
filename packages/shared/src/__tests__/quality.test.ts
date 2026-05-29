import { describe, it, expect } from 'vitest';
import { calcPayable, checkPayableSum } from '../quality.js';
import { can } from '../rbac.js';

describe('payable calc', () => {
  it('нестандарт НЕ оплачивается: payable = факт − брак − нестандарт', () => {
    // Огурцы из прототипа: 5000 / 100 / 750 → 4150 (83%)
    const r = calcPayable({ factKg: 5000, rejectKg: 100, nonStdKg: 750, nonStdPaidSeparately: false });
    expect(r.payableKg).toBe(4150);
    expect(r.payablePct).toBe(83);
  });

  it('нестандарт оплачивается отдельно: payable = факт − брак', () => {
    // Томаты: 5000 / 100 / 200 (оплачивается) → 4900 (98%)
    const r = calcPayable({ factKg: 5000, rejectKg: 100, nonStdKg: 200, nonStdPaidSeparately: true });
    expect(r.payableKg).toBe(4900);
    expect(r.payablePct).toBe(98);
  });

  it('checkPayableSum: Σ калибров = вес к оплате', () => {
    expect(checkPayableSum([1200, 2950], 4150).ok).toBe(true);
    const bad = checkPayableSum([1200, 2800], 4150);
    expect(bad.ok).toBe(false);
    expect(bad.diff).toBe(-150);
  });
});

describe('rbac matrix', () => {
  it('USER read-only', () => {
    expect(can('USER', 'shipments:read')).toBe(true);
    expect(can('USER', 'shipments:write')).toBe(false);
    expect(can('USER', 'references:write')).toBe(false);
  });
  it('OPERATOR: markArrived + quality, no references:write', () => {
    expect(can('OPERATOR', 'shipments:markArrived')).toBe(true);
    expect(can('OPERATOR', 'quality:write')).toBe(true);
    expect(can('OPERATOR', 'references:write')).toBe(false);
    expect(can('OPERATOR', 'shipments:write')).toBe(false);
  });
  it('ADMIN: all', () => {
    expect(can('ADMIN', 'references:write')).toBe(true);
    expect(can('ADMIN', 'plan:write')).toBe(true);
    expect(can('ADMIN', 'shipments:write')).toBe(true);
  });
});
