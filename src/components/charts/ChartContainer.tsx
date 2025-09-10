import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface ChartContainerProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
}

export function ChartContainer({
  title,
  description,
  className,
  children,
  loading = false,
  error
}: ChartContainerProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-[300px] text-destructive">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && children}
      </CardContent>
    </Card>
  );
}