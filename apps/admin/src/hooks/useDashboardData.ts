import useSWR from "swr";

export function useDailyStats(days: number) {
  return useSWR(`/api/dashboard/stats?days=${days}`);
}

export function usePagePerformance(days: number) {
  return useSWR(`/api/dashboard/pages?days=${days}`);
}

export function useGeoStats(days: number) {
  return useSWR(`/api/dashboard/geo?days=${days}`);
}

export function useTrafficSources(days: number) {
  return useSWR(`/api/dashboard/sources?days=${days}`);
}
