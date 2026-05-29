import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Capability, Role, UserDto } from '@wsm/shared';
import { can } from '@wsm/shared';
import { api, ApiError } from '../lib/api';

interface AuthValue {
  user: UserDto | null;
  loading: boolean;
  role: Role | null;
  can: (cap: Capability) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await api.get<UserDto>('/auth/me');
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
  });

  const user = data ?? null;

  const value: AuthValue = {
    user,
    loading: isLoading,
    role: user?.role ?? null,
    can: (cap) => (user ? can(user.role, cap) : false),
    login: async (email, password) => {
      await api.post('/auth/login', { email, password });
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
    logout: async () => {
      await api.post('/auth/logout');
      qc.setQueryData(['me'], null);
      await qc.invalidateQueries();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
