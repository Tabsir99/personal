import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useDailyStats(days: number) {
  return useSWR(`/api/dashboard/stats?days=${days}`, fetcher);
}

export function usePagePerformance(days: number) {
  return useSWR(`/api/dashboard/pages?days=${days}`, fetcher);
}

export function useGeoStats(days: number) {
  return useSWR(`/api/dashboard/geo?days=${days}`, fetcher);
}

export function useTrafficSources(days: number) {
  return useSWR(`/api/dashboard/sources?days=${days}`, fetcher);
}
