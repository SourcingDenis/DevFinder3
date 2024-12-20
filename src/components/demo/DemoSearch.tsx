import { motion, useScroll, useSpring } from 'framer-motion';
import { IconRocket, IconUsers, IconCode, IconBrain, IconCircleCheck, IconCircleDot, IconCircle } from '@tabler/icons-react';
import { useRef } from 'react';

interface RoadmapItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  quarter: string;
  status: 'completed' | 'current' | 'upcoming';
}

const roadmapItems: RoadmapItem[] = [
  {
    icon: <IconRocket strokeWidth={1.5} />,
    title: 'Launch & Core Features',
    description: 'Basic developer search and profile viewing capabilities',
    quarter: 'Q4 2024',
    status: 'current'
  },
  {
    icon: <IconUsers strokeWidth={1.5} />,
    title: 'Enhanced Collaboration',
    description: 'Team formation and project matching features',
    quarter: 'Q1 2025',
    status: 'upcoming'
  },
  {
    icon: <IconCode strokeWidth={1.5} />,
    title: 'Advanced Search',
    description: 'AI-powered skill matching and recommendation system',
    quarter: 'Q2 2025',
    status: 'upcoming'
  },
  {
    icon: <IconBrain strokeWidth={1.5} />,
    title: 'AI Integration',
    description: 'Intelligent developer insights and predictive analytics',
    quarter: 'Q3 2025',
    status: 'upcoming'
  }
];

const getStatusIcon = (status: RoadmapItem['status']) => {
  switch (status) {
    case 'completed':
      return <IconCircleCheck className="w-6 h-6" />;
    case 'current':
      return <IconCircleDot className="w-6 h-6" />;
    case 'upcoming':
      return <IconCircle className="w-6 h-6" />;
  }
};

export function DemoSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="container mx-auto px-4 py-16" ref={containerRef}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-16"
      >
        Development Timeline
      </motion.h2>

      {/* Mobile Timeline (vertical) */}
      <div className="lg:hidden space-y-8">
        {roadmapItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.21, 0.45, 0.27, 0.9]
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative flex items-start space-x-4 p-4 rounded-lg border border-border/50 hover:border-border/80 transition-colors"
          >
            <div className="flex-shrink-0 p-2 rounded-full bg-muted">
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-sm text-muted-foreground">{item.quarter}</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-2 text-primary/80">
                {getStatusIcon(item.status)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Timeline (horizontal) */}
      <div className="hidden lg:block relative">
        {/* Progress line container */}
        <div className="absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-border via-border/50 to-border/20">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60"
            style={{ scaleX: progress, transformOrigin: "left" }}
          />
        </div>

        <div className="grid grid-cols-4 gap-12">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.21, 0.45, 0.27, 0.9]
              }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              {/* Status indicator */}
              <motion.div 
                className={`absolute top-[44px] left-1/2 -translate-x-1/2 text-primary
                  ${item.status === 'current' ? 'text-primary' : 
                    item.status === 'completed' ? 'text-primary/80' : 'text-primary/40'}`}
                initial={{ scale: 0, rotate: -45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.1 + 0.2,
                  type: "spring"
                }}
              >
                {getStatusIcon(item.status)}
              </motion.div>
              
              <div className="pt-24 group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`space-y-4 ${item.status === 'current' ? 'relative' : ''}`}
                >
                  {item.status === 'current' && (
                    <motion.div 
                      className="absolute -inset-4 rounded-lg bg-primary/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <div className={`text-primary transition-opacity
                    ${item.status === 'current' ? 'opacity-100' : 
                      item.status === 'completed' ? 'opacity-80' : 'opacity-40'}`}>
                    {item.icon}
                  </div>
                  <div className="relative">
                    <div className="text-sm text-muted-foreground mb-1">
                      {item.quarter}
                    </div>
                    <h3 className={`font-medium text-lg mb-2 transition-colors
                      ${item.status === 'current' ? 'text-primary' : ''}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
