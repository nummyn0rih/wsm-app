import { z } from 'zod';
import { Role } from './enums.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Безопасный профиль пользователя (без passwordHash) — то, что отдаёт /auth/me.
export const userDto = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: Role,
});
export type UserDto = z.infer<typeof userDto>;
