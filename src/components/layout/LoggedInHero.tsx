import { motion } from 'framer-motion';
import { Search, Users, Download, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const quickActions = [
  {
    icon: Search,
    title: 'Quick Search',
    description: 'Find developers instantly'
  },
  {
    icon: Users,
    title: 'Explore Profiles',
    description: 'Discover new talent'
  },
  {
    icon: Download,
    title: 'Export Data',
    description: 'Download search results'
  },
  {
    icon: BookmarkCheck,
    title: 'Save Favorites',
    description: 'Bookmark interesting profiles'
  }
];

export function LoggedInHero() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-background border-b">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 opacity-50" />
      
      <div className="relative z-10 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              Welcome back, {user?.name || 'Developer'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Ready to discover and connect with top GitHub talent?
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-background/80 backdrop-blur-sm border rounded-lg p-4 text-center hover:shadow-md transition-all"
              >
                <div className="mb-3 flex justify-center">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
