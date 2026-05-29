import type { Role } from './enums.js';

// Capability-based RBAC for MVP (Отгрузки + Справочники).
// Пользователь: чтение Отгрузок + просмотр Водителей.
// Оператор: + отметить Прибыло + все действия с актами/качеством.
// Админ: всё (CRUD справочников, создание/правка отгрузок, переход в Отправлено).
export type Capability =
  | 'references:read'
  | 'references:write' // CRUD любых справочников
  | 'shipments:read'
  | 'shipments:write' // создать/редактировать/удалить отгрузку
  | 'shipments:markArrived' // переход SHIPPED → ARRIVED
  | 'quality:write' // внести данные качества / загрузить PDF акта
  | 'plan:read'
  | 'plan:write';

const MATRIX: Record<Role, Capability[]> = {
  USER: ['references:read', 'shipments:read', 'plan:read'],
  OPERATOR: [
    'references:read',
    'shipments:read',
    'shipments:markArrived',
    'quality:write',
    'plan:read',
  ],
  ADMIN: [
    'references:read',
    'references:write',
    'shipments:read',
    'shipments:write',
    'shipments:markArrived',
    'quality:write',
    'plan:read',
    'plan:write',
  ],
  MANAGER: ['references:read', 'shipments:read', 'plan:read'], // заложено на будущее
};

export function can(role: Role, cap: Capability): boolean {
  return MATRIX[role]?.includes(cap) ?? false;
}
