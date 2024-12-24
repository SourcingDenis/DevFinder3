import { type LucideIcon, Code2, Blocks, Braces, FileJson, Database, Cog, Hash } from 'lucide-react';

interface LanguageConfig {
  icon: LucideIcon;
  color: {
    bg: string;
    text: string;
  };
}

const languageConfigs: Record<string, LanguageConfig> = {
  JavaScript: {
    icon: Braces,
    color: { bg: 'bg-yellow-100', text: 'text-yellow-800' }
  },
  TypeScript: {
    icon: Code2,
    color: { bg: 'bg-blue-100', text: 'text-blue-800' }
  },
  Python: {
    icon: Blocks,
    color: { bg: 'bg-green-100', text: 'text-green-800' }
  },
  Java: {
    icon: Cog,
    color: { bg: 'bg-orange-100', text: 'text-orange-800' }
  },
  Ruby: {
    icon: Hash,
    color: { bg: 'bg-red-100', text: 'text-red-800' }
  },
  PHP: {
    icon: Database,
    color: { bg: 'bg-purple-100', text: 'text-purple-800' }
  },
  JSON: {
    icon: FileJson,
    color: { bg: 'bg-gray-100', text: 'text-gray-800' }
  }
};

const defaultConfig: LanguageConfig = {
  icon: Code2,
  color: { bg: 'bg-violet-100', text: 'text-violet-800' }
};

export function getLanguageConfig(language: string): LanguageConfig {
  return languageConfigs[language] || defaultConfig;
}
