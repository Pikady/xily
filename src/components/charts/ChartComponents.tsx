import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart as RechartsAreaChart
} from 'recharts';
import { cn } from '@/lib/utils';

// 颜色调色板
export const CHART_COLORS = {
  primary: '#3498db',
  secondary: '#e67e22',
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#9b59b6',
  light: '#ecf0f1',
  dark: '#34495e',
  // 探索模式（蓝色系）
  explore: ['#3498db', '#2980b9', '#5dade2', '#85c1e9', '#aed6f1'],
  // 利用模式（橙色系）
  utilize: ['#e67e22', '#d35400', '#f39c12', '#f8c471', '#fdebd0']
};

// 自定义Tooltip组件
export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any) => string;
}

export function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// 饼图组件
export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartData[];
  className?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
}

export function PieChart({
  data,
  className,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLabel = true
}: PieChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={showLabel ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || CHART_COLORS.primary}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 柱状图组件
export interface BarChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface BarChartProps {
  data: BarChartData[];
  className?: string;
  height?: number;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function BarChart({
  data,
  className,
  height = 300,
  dataKey,
  xAxisKey,
  color = CHART_COLORS.primary,
  showGrid = true,
  showLegend = false
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar dataKey={dataKey} fill={color} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 折线图组件
export interface LineChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface LineChartProps {
  data: LineChartData[];
  className?: string;
  height?: number;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
}

export function LineChart({
  data,
  className,
  height = 300,
  dataKey,
  xAxisKey,
  color = CHART_COLORS.primary,
  showGrid = true,
  showLegend = false,
  strokeWidth = 2
}: LineChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            dot={{ fill: color }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 面积图组件
export interface AreaChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface AreaChartProps {
  data: AreaChartData[];
  className?: string;
  height?: number;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  fillOpacity?: number;
}

export function AreaChart({
  data,
  className,
  height = 300,
  dataKey,
  xAxisKey,
  color = CHART_COLORS.primary,
  showGrid = true,
  showLegend = false,
  fillOpacity = 0.3
}: AreaChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={fillOpacity}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}