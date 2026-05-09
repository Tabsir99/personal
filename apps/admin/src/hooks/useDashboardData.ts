import { useCustomSWR } from "./useCustomSwr";

export function useDailyStats(days: number) {
  return useCustomSWR<any[]>(`/api/dashboard/stats?days=${days}`);
}

export function usePagePerformance(days: number) {
  return useCustomSWR<any[]>(`/api/dashboard/pages?days=${days}`);
}

export function useGeoStats(days: number) {
  return useCustomSWR<any[]>(`/api/dashboard/geo?days=${days}`);
}

export function useTrafficSources(days: number) {
  return useCustomSWR<any[]>(`/api/dashboard/sources?days=${days}`);
}
