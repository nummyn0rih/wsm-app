import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Carrier, Driver, RawMaterial, Supplier, TaraType } from '../../lib/types';

// Shared reference lookups used by shipment/quality forms.
export function useRefData() {
  const raws = useQuery({ queryKey: ['ref', 'raw-materials'], queryFn: () => api.get<RawMaterial[]>('/raw-materials') });
  const suppliers = useQuery({ queryKey: ['ref', 'suppliers'], queryFn: () => api.get<Supplier[]>('/suppliers') });
  const drivers = useQuery({ queryKey: ['ref', 'drivers'], queryFn: () => api.get<Driver[]>('/drivers') });
  const carriers = useQuery({ queryKey: ['ref', 'carriers'], queryFn: () => api.get<Carrier[]>('/carriers') });
  const tara = useQuery({ queryKey: ['ref', 'tara-types'], queryFn: () => api.get<TaraType[]>('/tara-types') });
  return {
    raws: raws.data ?? [],
    suppliers: suppliers.data ?? [],
    drivers: drivers.data ?? [],
    carriers: carriers.data ?? [],
    tara: tara.data ?? [],
    loading: raws.isLoading || suppliers.isLoading || drivers.isLoading,
  };
}
