import { z } from 'zod';
import { IngredientUnit, QualityParamRole, SupplierStatus, TaraKind } from './enums.js';

// ── Сырьё ──
export const rawMaterialCreate = z.object({
  name: z.string().min(1),
  defaultUnit: z.string().min(1).default('кг'),
  colorBg: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorDot: z.string().min(1), // допускаем градиент/hex
});
export const rawMaterialUpdate = rawMaterialCreate.partial();
export type RawMaterialCreate = z.infer<typeof rawMaterialCreate>;

// ── Параметр качества ──
export const qualityParamCreate = z.object({
  rawMaterialId: z.string(),
  name: z.string().min(1),
  unit: z.string().min(1).default('кг'),
  role: QualityParamRole,
  order: z.number().int().min(0).default(0),
});
export const qualityParamUpdate = qualityParamCreate.partial().omit({ rawMaterialId: true });
export type QualityParamCreate = z.infer<typeof qualityParamCreate>;

// ── ТК ──
export const carrierCreate = z.object({ name: z.string().min(1) });
export const carrierUpdate = carrierCreate.partial();

// ── Водитель ──
export const driverCreate = z.object({
  fio: z.string().min(1),
  phone: z.string().min(1),
  carrierId: z.string().nullish(),
  info: z.string().nullish(),
});
export const driverUpdate = driverCreate.partial();
export type DriverCreate = z.infer<typeof driverCreate>;

// ── Поставщик ──
export const supplierCreate = z.object({
  name: z.string().min(1),
  inn: z.string().nullish(),
  legalForm: z.string().nullish(),
  legalAddr: z.string().nullish(),
  factAddr: z.string().nullish(),
  status: SupplierStatus.default('ACTIVE'),
  tags: z.array(z.string()).default([]),
  startDate: z.string().datetime().nullish(),
  note: z.string().nullish(),
});
export const supplierUpdate = supplierCreate.partial();
export type SupplierCreate = z.infer<typeof supplierCreate>;

// ── Виды тары ──
export const taraTypeCreate = z.object({ name: z.string().min(1), kind: TaraKind });
export const taraTypeUpdate = taraTypeCreate.partial();

// ── Ингредиенты ──
export const ingredientCreate = z.object({
  name: z.string().min(1),
  unit: IngredientUnit,
  qtyOnPlant: z.number().min(0).default(0),
});
export const ingredientUpdate = ingredientCreate.partial();

// ── Сезоны ──
export const seasonCreate = z.object({ name: z.string().min(1), isCurrent: z.boolean().default(false) });
export const seasonUpdate = seasonCreate.partial();
