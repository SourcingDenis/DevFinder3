import { Search, Users, Download, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Find developers by location, language, and more'
  },
  {
    icon: Users,
    title: 'Detailed Profiles',
    description: 'View comprehensive developer information and statistics'
  },
  {
    icon: Download,
    title: 'Export Data',
    description: 'Download search results in CSV format'
  },
  {
    icon: BookmarkCheck,
    title: 'Save Profiles',
    description: 'Bookmark interesting profiles for later reference'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Hero() {
  return (
    <div className="relative overflow-hidden border-b bg-background min-h-[80vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-black/10" />
      </div>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_65%)]" />

      <div className="container relative max-w-screen-2xl z-10">
        <div className="flex flex-col items-center text-center py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              Find Top GitHub Developers
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 mx-auto">
              Discover talented developers worldwide. Search, analyze, and connect with GitHub users based on their skills, location, and contributions.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-screen-xl"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group flex flex-col items-center p-6 rounded-xl bg-background/80 backdrop-blur-sm border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}