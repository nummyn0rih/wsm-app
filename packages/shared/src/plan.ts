import { z } from 'zod';

export const weekPlanQuery = z.object({
  year: z.coerce.number().int(),
  week: z.coerce.number().int().min(1).max(53),
});
export type WeekPlanQuery = z.infer<typeof weekPlanQuery>;

// Обновление целевых значений ячеек (rawMaterial × день недели).
export const weekPlanCellInput = z.object({
  rawMaterialId: z.string(),
  dayOfWeek: z.number().int().min(1).max(6),
  planKg: z.number().min(0),
});
export const weekPlanUpdate = z.object({
  year: z.number().int(),
  week: z.number().int().min(1).max(53),
  cells: z.array(weekPlanCellInput),
});
export type WeekPlanUpdate = z.infer<typeof weekPlanUpdate>;

// Видимость сырья в таблице плана (per-week).
export const weekPlanVisibilityUpdate = z.object({
  year: z.number().int(),
  week: z.number().int().min(1).max(53),
  items: z.array(z.object({ rawMaterialId: z.string(), visible: z.boolean() })),
});
export type WeekPlanVisibilityUpdate = z.infer<typeof weekPlanVisibilityUpdate>;

// «Раскрытие» ячейки плана → новая отгрузка со статусом PLANNED (Запланировано).
export const planExpandToShipment = z.object({
  rawMaterialId: z.string(),
  supplierId: z.string(),
  kg: z.number().positive(),
  arrDate: z.string().datetime(),
});
export type PlanExpandToShipment = z.infer<typeof planExpandToShipment>;
