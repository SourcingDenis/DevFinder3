import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timeline, TimelineContent, TimelineItem, TimelinePoint, TimelineSeparator } from '@/components/ui/timeline';
import { cn } from '@/lib/utils';

// Define roadmap milestones with more detailed status
const roadmapMilestones = [
  {
    phase: 'Core Search Features',
    description: 'Essential GitHub developer search capabilities',
    status: 'completed',
    timeline: 'Q4 2024',
    features: [
      'GitHub user search API integration',
      'Email extraction from public commits',
      'Export search results as CSV',
      'Save profiles and create custom lists',
      'Save searches for later use'
    ]
  },
  {
    phase: 'Email Integration',
    description: 'Enhanced email capabilities with Gmail integration',
    status: 'in-progress',
    timeline: 'Q1 2025',
    features: [
      'Gmail API integration',
      'Email template management',
      'Email tracking and analytics',
      'Bulk email campaigns'
    ]
  },
  {
    phase: 'Talent Insights',
    description: 'Advanced analytics and geographical insights',
    status: 'planned',
    timeline: 'Q1 2025',
    features: [
      'Developer distribution by country',
      'Technology adoption trends',
      'Salary insights by region',
      'Talent pool analysis'
    ]
  },
  {
    phase: 'AI-Powered Features',
    description: 'Intelligent outreach and developer analysis',
    status: 'planned',
    timeline: 'Q2 2025',
    features: [
      'AI-generated personalized outreach messages',
      'Developer skill analysis',
      'Project contribution insights',
      'Technology stack recommendations'
    ]
  },
  {
    phase: 'Pipeline Management',
    description: 'Advanced recruitment pipeline features',
    status: 'future',
    timeline: 'Q2 2025',
    features: [
      'Kanban-style pipeline management',
      'Status tracking and updates',
      'Team collaboration tools',
      'Recruitment analytics dashboard'
    ]
  }
];

export function ProductRoadmap() {
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
