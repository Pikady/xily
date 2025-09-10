import { renderHook, act } from '@testing-library/react';
import { useDataSync } from '@/hooks/useDataSync';
import { useAnalyticsStore } from '@/stores/analyticsStore';

// Mock the analytics store
jest.mock('@/stores/analyticsStore');

const mockUseAnalyticsStore = useAnalyticsStore as jest.MockedFunction<typeof useAnalyticsStore>;

describe('useDataSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createMockStore = () => ({
    filters: {
      date_range: {
        start: '2024-01-01',
        end: '2024-01-31'
      }
    },
    loading: false,
    error: null,
    refreshAllData: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    setFilters: jest.fn()
  });

  it('should initialize with default options', () => {
    const mockStore = createMockStore();
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isAutoUpdateEnabled).toBe(true);
  });

  it('should call refreshAllData on mount', () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    renderHook(() => useDataSync());

    expect(mockStore.refreshAllData).toHaveBeenCalled();
  });

  it('should set loading state during refresh', async () => {
    const mockStore = createMockStore();
    let refreshPromise: Promise<any>;
    
    mockStore.refreshAllData.mockImplementation(() => {
      refreshPromise = new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
      return refreshPromise;
    });
    
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      result.current.refresh();
    });

    expect(mockStore.setLoading).toHaveBeenCalledWith(true);
    expect(mockStore.setLoading).toHaveBeenCalledWith(false);
  });

  it('should handle refresh errors', async () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockRejectedValue(new Error('Network error'));
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockStore.setError).toHaveBeenCalledWith('Network error');
  });

  it('should retry on failure', async () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({});
    
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(2);
  });

  it('should not retry when retryCount is 0', async () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockRejectedValue(new Error('Network error'));
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync({ retryCount: 0 }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(1);
  });

  it('should setup auto-refresh interval', () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    renderHook(() => useDataSync({ interval: 5000 }));

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(2);
  });

  it('should clear interval on unmount', () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { unmount } = renderHook(() => useDataSync({ interval: 5000 }));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(2);

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(2);
  });

  it('should not setup interval when enabled is false', () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    renderHook(() => useDataSync({ enabled: false, interval: 5000 }));

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(1);
  });

  it('should handle visibility changes', () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    renderHook(() => useDataSync({ interval: 5000 }));

    // Simulate page becoming visible
    act(() => {
      const event = new Event('visibilitychange');
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(event);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalled();
  });

  it('should handle online events', () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    renderHook(() => useDataSync({ interval: 5000 }));

    // Simulate coming back online
    act(() => {
      const event = new Event('online');
      window.dispatchEvent(event);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalled();
  });

  it('should not refresh when already loading', async () => {
    const mockStore = createMockStore();
    mockStore.loading = true;
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockStore.refreshAllData).not.toHaveBeenCalled();
  });

  it('should update last sync time on successful refresh', async () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    const beforeSync = result.current.lastSyncTime;

    await act(async () => {
      await result.current.refresh();
    });

    const afterSync = result.current.lastSyncTime;
    expect(afterSync.getTime()).toBeGreaterThan(beforeSync.getTime());
  });

  it('should respect custom retry delay', async () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({});
    
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync({ retryDelay: 2000 }));

    const startTime = Date.now();
    
    await act(async () => {
      await result.current.refresh();
    });

    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(2000);
  });

  it('should handle multiple refresh calls', async () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await Promise.all([
        result.current.refresh(),
        result.current.refresh(),
        result.current.refresh()
      ]);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(3);
  });

  it('should clear error on successful refresh', async () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    const { result } = renderHook(() => useDataSync());

    // Set initial error
    act(() => {
      result.current;
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockStore.setError).toHaveBeenCalledWith(null);
  });

  it('should work with different intervals', () => {
    const mockStore = createMockStore();
    mockStore.refreshAllData.mockResolvedValue({});
    mockUseAnalyticsStore.mockReturnValue(mockStore as any);

    renderHook(() => useDataSync({ interval: 10000 }));

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockStore.refreshAllData).toHaveBeenCalledTimes(3);
  });

  it('should handle store changes', () => {
    const mockStore1 = createMockStore();
    const mockStore2 = createMockStore();
    
    mockUseAnalyticsStore.mockReturnValue(mockStore1 as any);

    const { rerender } = renderHook(() => useDataSync());

    expect(mockStore1.refreshAllData).toHaveBeenCalledTimes(1);

    mockUseAnalyticsStore.mockReturnValue(mockStore2 as any);
    rerender();

    expect(mockStore2.refreshAllData).toHaveBeenCalledTimes(1);
  });
});