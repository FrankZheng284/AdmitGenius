export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true'
  }
} 