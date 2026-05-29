import { describe, it, expect } from 'vitest';
import { canTransition, isSequentialTransition, transitionError } from '../status.js';

describe('status transitions', () => {
  it('only sequential forward steps', () => {
    expect(isSequentialTransition('PLANNED', 'SHIPPED')).toBe(true);
    expect(isSequentialTransition('SHIPPED', 'ARRIVED')).toBe(true);
    expect(isSequentialTransition('PLANNED', 'ARRIVED')).toBe(false); // перескок
    expect(isSequentialTransition('ARRIVED', 'SHIPPED')).toBe(false); // назад
  });

  it('PLANNED → SHIPPED only ADMIN', () => {
    expect(canTransition('ADMIN', 'PLANNED', 'SHIPPED')).toBe(true);
    expect(canTransition('OPERATOR', 'PLANNED', 'SHIPPED')).toBe(false);
    expect(canTransition('USER', 'PLANNED', 'SHIPPED')).toBe(false);
  });

  it('SHIPPED → ARRIVED ADMIN or OPERATOR', () => {
    expect(canTransition('ADMIN', 'SHIPPED', 'ARRIVED')).toBe(true);
    expect(canTransition('OPERATOR', 'SHIPPED', 'ARRIVED')).toBe(true);
    expect(canTransition('USER', 'SHIPPED', 'ARRIVED')).toBe(false);
  });

  it('transitionError messages', () => {
    expect(transitionError('ADMIN', 'PLANNED', 'SHIPPED')).toBeNull();
    expect(transitionError('OPERATOR', 'PLANNED', 'SHIPPED')).toMatch(/не может/);
    expect(transitionError('ADMIN', 'PLANNED', 'ARRIVED')).toMatch(/последовательно/);
    expect(transitionError('ADMIN', 'PLANNED', 'PLANNED')).toMatch(/не изменился/);
  });
});
