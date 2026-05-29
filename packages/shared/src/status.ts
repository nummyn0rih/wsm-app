import type { Role, ShipmentStatus } from './enums.js';

// Shipment lifecycle is strictly sequential: PLANNED → SHIPPED → ARRIVED.
export const STATUS_ORDER: ShipmentStatus[] = ['PLANNED', 'SHIPPED', 'ARRIVED'];

// Allowed transitions + which roles may perform each one.
// PLANNED → SHIPPED: только Админ. SHIPPED → ARRIVED: Админ или Оператор.
export const STATUS_TRANSITIONS: {
  from: ShipmentStatus;
  to: ShipmentStatus;
  roles: Role[];
}[] = [
  { from: 'PLANNED', to: 'SHIPPED', roles: ['ADMIN'] },
  { from: 'SHIPPED', to: 'ARRIVED', roles: ['ADMIN', 'OPERATOR'] },
];

/** Is `to` the immediate next status after `from` (no skips, no going back)? */
export function isSequentialTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return STATUS_ORDER.indexOf(to) - STATUS_ORDER.indexOf(from) === 1;
}

/** May `role` move a shipment from `from` to `to`? Enforces sequence + RBAC. */
export function canTransition(role: Role, from: ShipmentStatus, to: ShipmentStatus): boolean {
  const t = STATUS_TRANSITIONS.find((x) => x.from === from && x.to === to);
  if (!t) return false;
  return t.roles.includes(role);
}

/** Reason string for a rejected transition (for API error messages). */
export function transitionError(role: Role, from: ShipmentStatus, to: ShipmentStatus): string | null {
  if (from === to) return 'Статус не изменился';
  if (!isSequentialTransition(from, to)) {
    return `Недопустимый переход ${from} → ${to}: только последовательно (${STATUS_ORDER.join(' → ')})`;
  }
  if (!canTransition(role, from, to)) {
    return `Роль ${role} не может выполнить переход ${from} → ${to}`;
  }
  return null;
}
