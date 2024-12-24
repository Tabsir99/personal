import useSWR, { SWRConfiguration, Fetcher } from "swr";

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000, // Prevent multiple requests for the same data within 2 seconds
  revalidateIfStale: false,
  keepPreviousData: true,
  shouldRetryOnError: false,
};

const fetcher: Fetcher<any> = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  return response.json();
};

// Custom SWR Hook
export function useCustomSWR<T = any>(
  key: string | null,
  config: SWRConfiguration = {}
) {
  const mergedConfig = { ...defaultConfig, ...config };

  return useSWR<T>(key, fetcher, mergedConfig);
}
