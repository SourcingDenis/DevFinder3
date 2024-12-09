import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timeline, TimelineContent, TimelineItem, TimelinePoint, TimelineSeparator } from '@/components/ui/timeline';
import { cn } from '@/lib/utils';

// Define roadmap milestones with more detailed status
const roadmapMilestones = [
  {
    phase: 'Alpha Launch',
    description: 'Initial DevFinder platform with core profile matching capabilities',
    status: 'completed',
    timeline: 'Q1 2024',
    features: [
      'Basic profile search',
      'Initial matching algorithm',
      'User registration'
    ]
  },
  {
    phase: 'Beta Enhancement',
    description: 'Advanced search and recommendation improvements',
    status: 'in-progress',
    timeline: 'Q2 2024',
    features: [
      'AI-powered matching',
      'Advanced search filters',
      'Performance optimizations'
    ]
  },
  {
    phase: 'MVP Release',
    description: 'Full platform capabilities with comprehensive features',
    status: 'planned',
    timeline: 'Q3 2024',
    features: [
      'Enterprise team matching',
      'Advanced analytics',
      'Integration capabilities'
    ]
  },
  {
    phase: 'Enterprise Expansion',
    description: 'Advanced organizational recruitment tools',
    status: 'future',
    timeline: 'Q4 2024',
    features: [
      'Custom organizational dashboards',
      'Advanced talent pooling',
      'Global talent network'
    ]
  }
];

export function ProductRoadmap() {
  const { user } = useAuth();

  // Redirect non-authenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">DevFinder Roadmap</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our journey to revolutionize developer discovery and connection
        </p>
      </div>

      <Timeline className="max-w-4xl mx-auto">
        {roadmapMilestones.map(milestone => (
          <TimelineItem key={milestone.phase} className="mb-8">
            <TimelinePoint 
              className={cn(
                "border-2",
                milestone.status === 'completed' && "border-green-500 bg-green-500/20",
                milestone.status === 'in-progress' && "border-blue-500 bg-blue-500/20",
                milestone.status === 'planned' && "border-yellow-500 bg-yellow-500/20",
                milestone.status === 'future' && "border-gray-500 bg-gray-500/20"
              )}
            />
            <TimelineSeparator />
            <TimelineContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {milestone.phase}
                    <Badge 
                      variant={
                        milestone.status === 'completed' ? 'default' :
                        milestone.status === 'in-progress' ? 'secondary' :
                        milestone.status === 'planned' ? 'outline' :
                        'destructive'
                      }
                    >
                      {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{milestone.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    Timeline: {milestone.timeline}
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {milestone.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
