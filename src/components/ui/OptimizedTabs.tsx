import { useCallback } from 'react'
import { 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  TabsRoot
} from './tabs'

interface OptimizedTabsProps {
  initialTab?: string
  onTabChange?: (value: string) => void
}

export function OptimizedTabs({ 
  initialTab = 'tab1', 
  onTabChange 
}: OptimizedTabsProps) {
  // Memoized event handler using useCallback
  const handleTabChange = useCallback((value: string) => {
    // Optional external callback
    onTabChange?.(value)

    // Log for demonstration
    console.log(`Tab changed to: ${value}`)
  }, [onTabChange])

  return (
    <TabsRoot 
      defaultValue={initialTab}
      onValueChange={handleTabChange}
    >
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>

      <TabsContent value="tab1">
        <div className="p-4">
          <h2 className="text-xl font-bold">Tab 1 Content</h2>
          <p>This is the content of Tab 1</p>
        </div>
      </TabsContent>

      <TabsContent value="tab2">
        <div className="p-4">
          <h2 className="text-xl font-bold">Tab 2 Content</h2>
          <p>This is the content of Tab 2</p>
        </div>
      </TabsContent>

      <TabsContent value="tab3">
        <div className="p-4">
          <h2 className="text-xl font-bold">Tab 3 Content</h2>
          <p>This is the content of Tab 3</p>
        </div>
      </TabsContent>
    </TabsRoot>
  )
}
