import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PieChart, BarChart, LineChart, AreaChart } from '@/components/charts/ChartComponents';
import { ChartContainer } from '@/components/charts/ChartContainer';

// 测试数据
const mockPieData = [
  { name: '作品A', value: 120, color: '#3498db' },
  { name: '作品B', value: 80, color: '#e67e22' },
  { name: '作品C', value: 60, color: '#2ecc71' }
];

const mockBarData = [
  { name: '周一', value: 120, explore: 80, utilize: 40 },
  { name: '周二', value: 90, explore: 60, utilize: 30 },
  { name: '周三', value: 150, explore: 100, utilize: 50 }
];

const mockLineData = [
  { date: '2024-01-01', value: 120, formattedDate: '01/01' },
  { date: '2024-01-02', value: 140, formattedDate: '01/02' },
  { date: '2024-01-03', value: 110, formattedDate: '01/03' }
];

describe('Chart Components', () => {
  describe('ChartContainer', () => {
    it('renders chart with title and description', () => {
      render(
        <ChartContainer title="测试图表" description="这是一个测试图表">
          <div>图表内容</div>
        </ChartContainer>
      );

      expect(screen.getByText('测试图表')).toBeInTheDocument();
      expect(screen.getByText('这是一个测试图表')).toBeInTheDocument();
      expect(screen.getByText('图表内容')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <ChartContainer title="测试图表" loading={true}>
          <div>图表内容</div>
        </ChartContainer>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('图表内容')).not.toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <ChartContainer title="测试图表" error="加载失败">
          <div>图表内容</div>
        </ChartContainer>
      );

      expect(screen.getByText('加载失败')).toBeInTheDocument();
      expect(screen.queryByText('图表内容')).not.toBeInTheDocument();
    });
  });

  describe('PieChart', () => {
    it('renders pie chart with data', () => {
      const { container } = render(<PieChart data={mockPieData} height={300} />);
      
      expect(container.querySelector('.recharts-pie-chart')).toBeInTheDocument();
      expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(mockPieData.length);
    });

    it('shows labels when showLabel is true', () => {
      const { container } = render(<PieChart data={mockPieData} showLabel={true} />);
      
      expect(container.querySelector('.recharts-pie-label')).toBeInTheDocument();
    });

    it('hides labels when showLabel is false', () => {
      const { container } = render(<PieChart data={mockPieData} showLabel={false} />);
      
      expect(container.querySelector('.recharts-pie-label')).not.toBeInTheDocument();
    });
  });

  describe('BarChart', () => {
    it('renders bar chart with data', () => {
      const { container } = render(
        <BarChart
          data={mockBarData}
          dataKey="value"
          xAxisKey="name"
          height={300}
        />
      );
      
      expect(container.querySelector('.recharts-bar-chart')).toBeInTheDocument();
      expect(container.querySelectorAll('.recharts-bar')).toHaveLength(mockBarData.length);
    });

    it('shows grid when showGrid is true', () => {
      const { container } = render(
        <BarChart
          data={mockBarData}
          dataKey="value"
          xAxisKey="name"
          showGrid={true}
        />
      );
      
      expect(container.querySelector('.recharts-cartesian-grid')).toBeInTheDocument();
    });

    it('hides grid when showGrid is false', () => {
      const { container } = render(
        <BarChart
          data={mockBarData}
          dataKey="value"
          xAxisKey="name"
          showGrid={false}
        />
      );
      
      expect(container.querySelector('.recharts-cartesian-grid')).not.toBeInTheDocument();
    });
  });

  describe('LineChart', () => {
    it('renders line chart with data', () => {
      const { container } = render(
        <LineChart
          data={mockLineData}
          dataKey="value"
          xAxisKey="formattedDate"
          height={300}
        />
      );
      
      expect(container.querySelector('.recharts-line-chart')).toBeInTheDocument();
      expect(container.querySelector('.recharts-line')).toBeInTheDocument();
    });

    it('shows dots on data points', () => {
      const { container } = render(
        <LineChart
          data={mockLineData}
          dataKey="value"
          xAxisKey="formattedDate"
        />
      );
      
      expect(container.querySelectorAll('.recharts-dot')).toHaveLength(mockLineData.length);
    });
  });

  describe('AreaChart', () => {
    it('renders area chart with data', () => {
      const { container } = render(
        <AreaChart
          data={mockLineData}
          dataKey="value"
          xAxisKey="formattedDate"
          height={300}
        />
      );
      
      expect(container.querySelector('.recharts-area-chart')).toBeInTheDocument();
      expect(container.querySelector('.recharts-area')).toBeInTheDocument();
    });

    it('applies fill opacity correctly', () => {
      const { container } = render(
        <AreaChart
          data={mockLineData}
          dataKey="value"
          xAxisKey="formattedDate"
          fillOpacity={0.5}
        />
      );
      
      const area = container.querySelector('.recharts-area');
      expect(area).toHaveAttribute('fill-opacity', '0.5');
    });
  });
});

// 图表交互测试
describe('Chart Interactions', () => {
  describe('Tooltip functionality', () => {
    it('shows tooltip on hover', async () => {
      const { container } = render(
        <BarChart
          data={mockBarData}
          dataKey="value"
          xAxisKey="name"
          height={300}
        />
      );

      const bar = container.querySelector('.recharts-bar');
      fireEvent.mouseOver(bar!);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      const { container } = render(
        <BarChart
          data={mockBarData}
          dataKey="value"
          xAxisKey="name"
          height={300}
        />
      );

      const bar = container.querySelector('.recharts-bar');
      fireEvent.mouseOver(bar!);
      fireEvent.mouseOut(bar!);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Legend functionality', () => {
    it('shows legend when showLegend is true', () => {
      const { container } = render(
        <BarChart
          data={mockBarData}
          dataKey="value"
          xAxisKey="name"
          showLegend={true}
        />
      );
      
      expect(container.querySelector('.recharts-legend')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      const { container } = render(
        <BarChart
          data={mockBarData}
          dataKey="value"
          xAxisKey="name"
          showLegend={false}
        />
      );
      
      expect(container.querySelector('.recharts-legend')).not.toBeInTheDocument();
    });
  });
});

// 响应式测试
describe('Chart Responsiveness', () => {
  it('adapts to container size changes', () => {
    const { container } = render(
      <PieChart data={mockPieData} height={300} />
    );

    const chartContainer = container.querySelector('.recharts-wrapper');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveStyle({ width: '100%', height: '100%' });
  });

  it('maintains aspect ratio on resize', () => {
    const { container } = render(
      <LineChart data={mockLineData} dataKey="value" xAxisKey="formattedDate" height={300} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '100%');
    expect(svg).toHaveAttribute('height', '100%');
  });
});

// 性能测试
describe('Chart Performance', () => {
  it('handles large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      name: `项目${i}`,
      value: Math.floor(Math.random() * 1000)
    }));

    const startTime = performance.now();
    render(<BarChart data={largeDataset} dataKey="value" xAxisKey="name" height={300} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成渲染
  });

  it('updates efficiently on data changes', () => {
    const { rerender } = render(
      <BarChart data={mockBarData} dataKey="value" xAxisKey="name" height={300} />
    );

    const updatedData = mockBarData.map(item => ({
      ...item,
      value: item.value * 2
    }));

    const startTime = performance.now();
    rerender(<BarChart data={updatedData} dataKey="value" xAxisKey="name" height={300} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(500); // 应该在0.5秒内完成更新
  });
});

// 可访问性测试
describe('Chart Accessibility', () => {
  it('provides proper ARIA labels', () => {
    render(
      <ChartContainer title="销售数据" description="2024年销售数据统计">
        <PieChart data={mockPieData} height={300} />
      </ChartContainer>
    );

    const chartContainer = screen.getByRole('img');
    expect(chartContainer).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const { container } = render(
      <BarChart data={mockBarData} dataKey="value" xAxisKey="name" height={300} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('tabindex', '0');
  });
});