import { z } from 'zod';

// Source-of-truth enums for API + web (mirror Prisma enums in db/prisma/schema.prisma).

export const Role = z.enum(['ADMIN', 'OPERATOR', 'USER', 'MANAGER']);
export type Role = z.infer<typeof Role>;

export const ShipmentStatus = z.enum(['PLANNED', 'SHIPPED', 'ARRIVED']);
export type ShipmentStatus = z.infer<typeof ShipmentStatus>;

export const SupplierStatus = z.enum(['ACTIVE', 'ARCHIVE']);
export type SupplierStatus = z.infer<typeof SupplierStatus>;

export const TaraKind = z.enum(['BOX', 'DRUM_METAL', 'DRUM_PLASTIC']);
export type TaraKind = z.infer<typeof TaraKind>;

export const IngredientUnit = z.enum(['LITER', 'TON', 'KG']);
export type IngredientUnit = z.infer<typeof IngredientUnit>;

export const QualityParamRole = z.enum(['PAYABLE', 'NONSTD', 'REJECT', 'INFO']);
export type QualityParamRole = z.infer<typeof QualityParamRole>;

// Human-readable RU labels (for UI; backend stays enum-based).
export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  PLANNED: 'Запланировано',
  SHIPPED: 'Отправлено',
  ARRIVED: 'Прибыло',
};

export const QUALITY_PARAM_ROLE_LABEL: Record<QualityParamRole, string> = {
  PAYABLE: 'Детализирует вес к оплате',
  NONSTD: 'Дублирует поле Нестандарт',
  REJECT: 'Дублирует поле Брак',
  INFO: 'Информационный',
};

export const TARA_KIND_LABEL: Record<TaraKind, string> = {
  BOX: 'ящик',
  DRUM_METAL: 'бочка железо',
  DRUM_PLASTIC: 'бочка пластик',
};

export const INGREDIENT_UNIT_LABEL: Record<IngredientUnit, string> = {
  LITER: 'литры',
  TON: 'тонны',
  KG: 'кг',
};
