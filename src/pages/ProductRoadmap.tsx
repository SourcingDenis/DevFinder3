import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Rocket, 
  Star 
} from 'lucide-react';

type RoadmapItem = {
  title: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string[];
  icon: React.ElementType;
};

const ProductRoadmap: React.FC = () => {
  const completedFeatures: RoadmapItem[] = [
    {
      title: 'Advanced Search Implementation',
      status: 'completed',
      description: [
        'Enhanced search filtering options',
        'Improved search algorithm with intelligent matching',
        'Support for complex multi-parameter queries',
        'Precise user attribute matching'
      ],
      icon: CheckCircle2
    },
    {
      title: 'GitHub Authentication',
      status: 'completed',
      description: [
        'Robust GitHub OAuth integration',
        'One-click secure login',
        'Automatic profile information retrieval',
        'Seamless GitHub credential authentication'
      ],
      icon: CheckCircle2
    },
    {
      title: 'Profile Management',
      status: 'completed',
      description: [
        'Save and store multiple developer profiles',
        'Local profile storage',
        'Profile management interface',
        'Add notes and tags to saved profiles'
      ],
      icon: CheckCircle2
    },
    {
      title: 'Search Persistence',
      status: 'completed',
      description: [
        'Save and revisit complex search queries',
        'Personalized search history management',
        'Export and import search configurations',
        'Quick access to previous searches'
      ],
      icon: CheckCircle2
    }
  ];

  const inProgressFeatures: RoadmapItem[] = [
    {
      title: 'Country Insights on Programming Languages',
      status: 'in-progress',
      description: [
        'Comprehensive analysis of programming language trends by country',
        'Visualization of language popularity and adoption rates',
        'Detailed regional tech ecosystem insights',
        'Interactive geographical data representation'
      ],
      icon: Clock
    },
    {
      title: 'Commit Activity Analytics',
      status: 'in-progress',
      description: [
        'Detailed GitHub commit activity tracking',
        'Contribution pattern visualization',
        'Performance and productivity metrics',
        'Comparative analysis across developers'
      ],
      icon: Clock
    },
    {
      title: 'Community Metrics Dashboard',
      status: 'in-progress',
      description: [
        'Comprehensive community engagement metrics',
        'Open-source contribution tracking',
        'Social coding influence indicators',
        'Network and collaboration insights'
      ],
      icon: Clock
    }
  ];

  const plannedFeatures: RoadmapItem[] = [
    {
      title: 'Email Integration',
      status: 'planned',
      description: [
        'Gmail and Outlook integration',
        'Dedicated communication inbox',
        'Direct messaging with GitHub users',
        'Smart communication tracking',
        'Automated follow-up suggestions'
      ],
      icon: Rocket
    },
    {
      title: 'AI-Powered Outreach',
      status: 'planned',
      description: [
        'GPT-4o Mini integration',
        'Public activity analysis',
        'Hyper-personalized outreach messages',
        'Context-aware communication generation',
        'Intelligent networking recommendations'
      ],
      icon: Rocket
    },
    {
      title: 'Outreach Performance Analytics',
      status: 'planned',
      description: [
        'Comprehensive outreach engagement metrics',
        'Response rate tracking',
        'Conversion funnel visualization',
        'A/B testing for outreach strategies',
        'Personalization impact analysis',
        'Machine learning-driven optimization suggestions'
      ],
      icon: Rocket
    }
  ];

  const renderRoadmapSection = (title: string, items: RoadmapItem[], color: string) => (
    <section className="mb-8">
      <h2 className={`text-2xl font-bold mb-4 flex items-center text-${color}-600`}>
        {title === 'Completed' && <CheckCircle2 className="mr-2" />}
        {title === 'In Progress' && <Clock className="mr-2" />}
        {title === 'Planned' && <Rocket className="mr-2" />}
        {title}
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-4">
              <item.icon className={`w-6 h-6 text-${color}-500`} />
              <CardTitle className="m-0">{item.title}</CardTitle>
              <Badge 
                variant="outline" 
                className={`ml-auto text-${color}-600 border-${color}-300`}
              >
                {item.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {item.description.map((desc, descIndex) => (
                  <li key={descIndex}>{desc}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center">
          <Star className="mr-3 text-primary" />
          DevFinder Product Roadmap
          <Star className="ml-3 text-primary" />
        </h1>

        {renderRoadmapSection('Completed', completedFeatures, 'green')}
        {renderRoadmapSection('In Progress', inProgressFeatures, 'blue')}
        {renderRoadmapSection('Planned', plannedFeatures, 'purple')}

        <div className="mt-8 text-center text-muted-foreground italic">
          🚀 Our journey of innovation continues. Stay tuned for exciting updates! 🌟
        </div>
      </div>
    </div>
  );
};

export default ProductRoadmap;
