import React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-4', className)} {...props} />
  )
);
Timeline.displayName = 'Timeline';

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-border',
        className
      )} 
      {...props} 
    />
  )
);
TimelineItem.displayName = 'TimelineItem';

interface TimelinePointProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelinePoint = React.forwardRef<HTMLDivElement, TimelinePointProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'absolute left-0 top-0 -ml-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background',
        className
      )} 
      {...props} 
    />
  )
);
TimelinePoint.displayName = 'TimelinePoint';

interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'absolute left-0 top-0 h-full w-px bg-border',
        className
      )} 
      {...props} 
    />
  )
);
TimelineSeparator.displayName = 'TimelineSeparator';

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'pl-6 pt-1',
        className
      )} 
      {...props} 
    />
  )
);
TimelineContent.displayName = 'TimelineContent';

export { 
  Timeline, 
  TimelineItem, 
  TimelinePoint, 
  TimelineSeparator, 
  TimelineContent 
};
