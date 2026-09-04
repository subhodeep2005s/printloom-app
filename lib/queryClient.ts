import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false, // IMPORTANT for mobile
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
