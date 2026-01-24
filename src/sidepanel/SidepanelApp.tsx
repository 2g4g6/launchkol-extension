import { AuthScreen } from '../components/AuthScreen'
import { Dashboard } from '../components/Dashboard'
import { useAuthState, User } from '../shared/hooks/useAuthState'

export function SidepanelApp() {
  const { user, isLoading, isAuthenticated, setUser, signOut } = useAuthState()

  // Show loading state while checking auth
  if (isLoading) {
    return <LoadingScreen />
  }

  // If not authenticated, show auth screen within sidepanel
  if (!isAuthenticated || !user) {
    const handleAuthSuccess = (authenticatedUser: User) => {
      setUser(authenticatedUser)
    }
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  }

  // Show full dashboard
  return <Dashboard user={user} onSignOut={signOut} />
}

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#050508]">
      <div className="animate-spin">
        <i className="ri-loader-4-line text-2xl text-kol-blue" />
      </div>
    </div>
  )
}
