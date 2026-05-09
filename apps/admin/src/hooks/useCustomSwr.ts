import useSWR, { SWRConfiguration, Fetcher } from "swr";
import type { ApiResponse } from "@/lib/appUtils";

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
  revalidateIfStale: false,
  keepPreviousData: true,
  shouldRetryOnError: false,
};

const fetcher: Fetcher<any> = async (url: string) => {
  const response = await fetch(url);
  const body = (await response.json()) as ApiResponse<unknown>;
  if (!response.ok || body.status !== "success") {
    throw new Error(
      body.status === "error" ? body.message : `HTTP ${response.status}`,
    );
  }
  return body.data;
};

export function useCustomSWR<T = any>(
  key: string | null,
  config: SWRConfiguration = {},
) {
  const mergedConfig = { ...defaultConfig, ...config };
  return useSWR<T>(key, fetcher, mergedConfig);
}
