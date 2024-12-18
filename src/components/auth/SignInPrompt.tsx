import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export function SignInPrompt() {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <Card className="p-6 text-center space-y-4">
      <h3 className="text-lg font-semibold">Sign in to continue</h3>
      <p className="text-muted-foreground">
        Sign in with GitHub to view more results and save your searches
      </p>
      <Button onClick={handleSignIn}>
        Sign in with GitHub
      </Button>
    </Card>
  )
}
