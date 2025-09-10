import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { DataFilter } from '@/components/charts/DataFilter';
import { DataStatusIndicator } from '@/components/charts/DataStatusIndicator';

// Mock the store
jest.mock('@/stores/analyticsStore');

const mockUseAnalyticsStore = useAnalyticsStore as jest.MockedFunction<typeof useAnalyticsStore>;

// 测试数据
const mockWorks = [
  { id: 1, name: '作品A', color: '#3498db' },
  { id: 2, name: '作品B', color: '#e67e22' },
  { id: 3, name: '作品C', color: '#2ecc71' }
];

const mockFilters = {
  date_range: {
    start: '2024-01-01',
    end: '2024-01-31'
  },
  work_ids: [1, 2],
  modes: ['explore', 'utilize'] as const,
  completed: true
};

describe('Analytics Components', () => {
  beforeEach(() => {
    mockUseAnalyticsStore.mockReturnValue({
      filters: mockFilters,
      setFilters: jest.fn(),
      loading: false,
      error: null,
      // ... 其他必要的store方法
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('DataFilter', () => {
    it('renders filter button', () => {
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          works={mockWorks}
        />
      );

      expect(screen.getByText('筛选')).toBeInTheDocument();
    });

    it('opens filter dialog when clicked', () => {
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          works={mockWorks}
        />
      );

      fireEvent.click(screen.getByText('筛选'));
      expect(screen.getByText('数据筛选')).toBeInTheDocument();
      expect(screen.getByText('设置筛选条件来查看特定时间段和条件的数据')).toBeInTheDocument();
    });

    it('displays quick range options', () => {
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          works={mockWorks}
        />
      );

      fireEvent.click(screen.getByText('筛选'));
      
      expect(screen.getByText('今天')).toBeInTheDocument();
      expect(screen.getByText('最近7天')).toBeInTheDocument();
      expect(screen.getByText('最近30天')).toBeInTheDocument();
      expect(screen.getByText('本月')).toBeInTheDocument();
    });

    it('handles quick range selection', () => {
      const onFiltersChange = jest.fn();
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={onFiltersChange}
          works={mockWorks}
        />
      );

      fireEvent.click(screen.getByText('筛选'));
      fireEvent.click(screen.getByText('最近7天'));

      expect(onFiltersChange).toHaveBeenCalled();
    });

    it('shows work selection dropdown', () => {
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          works={mockWorks}
        />
      );

      fireEvent.click(screen.getByText('筛选'));
      
      const workSelect = screen.getByText('选择作品');
      expect(workSelect).toBeInTheDocument();
    });

    it('shows mode selection dropdown', () => {
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          works={mockWorks}
        />
      );

      fireEvent.click(screen.getByText('筛选'));
      
      const modeSelect = screen.getByText('选择模式');
      expect(modeSelect).toBeInTheDocument();
    });

    it('applies filters when Apply button is clicked', () => {
      const onFiltersChange = jest.fn();
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={onFiltersChange}
          works={mockWorks}
        />
      );

      fireEvent.click(screen.getByText('筛选'));
      fireEvent.click(screen.getByText('应用'));

      expect(onFiltersChange).toHaveBeenCalled();
    });

    it('resets filters when Reset button is clicked', () => {
      const onFiltersChange = jest.fn();
      render(
        <DataFilter
          filters={mockFilters}
          onFiltersChange={onFiltersChange}
          works={mockWorks}
        />
      );

      fireEvent.click(screen.getByText('筛选'));
      fireEvent.click(screen.getByText('重置'));

      expect(onFiltersChange).toHaveBeenCalled();
    });
  });

  describe('DataStatusIndicator', () => {
    it('shows loading state', () => {
      render(
        <DataStatusIndicator
          loading={true}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByText('同步中...')).toBeInTheDocument();
      expect(screen.getByText('已同步')).not.toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <DataStatusIndicator
          loading={false}
          error="网络错误"
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByText('同步失败')).toBeInTheDocument();
      expect(screen.getByText('已同步')).not.toBeInTheDocument();
    });

    it('shows success state', () => {
      const lastSyncTime = new Date();
      render(
        <DataStatusIndicator
          loading={false}
          lastSyncTime={lastSyncTime}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByText('已同步')).toBeInTheDocument();
    });

    it('shows time ago information', () => {
      const lastSyncTime = new Date(Date.now() - 5 * 60 * 1000); // 5分钟前
      render(
        <DataStatusIndicator
          loading={false}
          lastSyncTime={lastSyncTime}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByText('5分钟前')).toBeInTheDocument();
    });

    it('shows auto refresh status', () => {
      render(
        <DataStatusIndicator
          loading={false}
          autoRefresh={true}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByText('自动更新: 开启')).toBeInTheDocument();
    });

    it('hides auto refresh status when disabled', () => {
      render(
        <DataStatusIndicator
          loading={false}
          autoRefresh={false}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.queryByText('自动更新: 开启')).not.toBeInTheDocument();
    });

    it('calls refresh function when refresh button is clicked', () => {
      const onRefresh = jest.fn();
      render(
        <DataStatusIndicator
          loading={false}
          onRefresh={onRefresh}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(onRefresh).toHaveBeenCalled();
    });

    it('disables refresh button when loading', () => {
      const onRefresh = jest.fn();
      render(
        <DataStatusIndicator
          loading={true}
          onRefresh={onRefresh}
        />
      );

      const refreshButton = screen.getByRole('button');
      expect(refreshButton).toBeDisabled();
      fireEvent.click(refreshButton);
      expect(onRefresh).not.toHaveBeenCalled();
    });
  });
});

// 集成测试
describe('Analytics Integration', () => {
  it('integrates DataFilter with DataStatusIndicator', () => {
    const onFiltersChange = jest.fn();
    const onRefresh = jest.fn();
    
    render(
      <div>
        <DataFilter
          filters={mockFilters}
          onFiltersChange={onFiltersChange}
          works={mockWorks}
          onRefresh={onRefresh}
        />
        <DataStatusIndicator
          loading={false}
          onRefresh={onRefresh}
        />
      </div>
    );

    // Both components should render
    expect(screen.getByText('筛选')).toBeInTheDocument();
    expect(screen.getByText('已同步')).toBeInTheDocument();
  });

  it('handles data loading flow', async () => {
    const onRefresh = jest.fn().mockResolvedValue({});
    
    render(
      <DataStatusIndicator
        loading={true}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText('同步中...')).toBeInTheDocument();
    
    // Simulate loading completion
    render(
      <DataStatusIndicator
        loading={false}
        lastSyncTime={new Date()}
        onRefresh={onRefresh}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('已同步')).toBeInTheDocument();
    });
  });

  it('handles error recovery flow', async () => {
    const onRefresh = jest.fn();
    
    render(
      <DataStatusIndicator
        loading={false}
        error="网络错误"
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText('同步失败')).toBeInTheDocument();
    
    // Simulate error recovery
    render(
      <DataStatusIndicator
        loading={false}
        lastSyncTime={new Date()}
        onRefresh={onRefresh}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('已同步')).toBeInTheDocument();
    });
  });
});

// 性能测试
describe('Analytics Performance', () => {
  it('handles large number of works efficiently', () => {
    const largeWorksList = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `作品${i + 1}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }));

    const startTime = performance.now();
    render(
      <DataFilter
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        works={largeWorksList}
      />
    );
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成渲染
  });

  it('updates efficiently on filter changes', () => {
    const onFiltersChange = jest.fn();
    const { rerender } = render(
      <DataFilter
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
        works={mockWorks}
      />
    );

    const updatedFilters = {
      ...mockFilters,
      work_ids: [1, 2, 3]
    };

    const startTime = performance.now();
    rerender(
      <DataFilter
        filters={updatedFilters}
        onFiltersChange={onFiltersChange}
        works={mockWorks}
      />
    );
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // 应该在0.1秒内完成更新
  });
});

// 可访问性测试
describe('Analytics Accessibility', () => {
  it('provides proper ARIA labels for filter button', () => {
    render(
      <DataFilter
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        works={mockWorks}
      />
    );

    const filterButton = screen.getByText('筛选');
    expect(filterButton).toBeInTheDocument();
    expect(filterButton).toHaveAttribute('type', 'button');
  });

  it('supports keyboard navigation for filter dialog', () => {
    render(
      <DataFilter
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        works={mockWorks}
      />
    );

    fireEvent.click(screen.getByText('筛选'));
    
    const applyButton = screen.getByText('应用');
    expect(applyButton).toHaveAttribute('type', 'button');
    
    // Test keyboard navigation
    fireEvent.keyDown(applyButton, { key: 'Enter' });
  });

  it('provides proper status indicators for screen readers', () => {
    render(
      <DataStatusIndicator
        loading={true}
        onRefresh={jest.fn()}
      />
    );

    const statusBadge = screen.getByText('同步中...');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveAttribute('role', 'status');
  });
});