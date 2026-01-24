import { useState, useEffect } from 'react'
import { AuthScreen } from '../components/AuthScreen'
import { OpenSidebarPrompt } from '../components/OpenSidebarPrompt'
import { useAuthState, User } from '../shared/hooks/useAuthState'

type PopupView = 'auth' | 'open-sidebar'

export function PopupApp() {
  const { user, isLoading, isAuthenticated, setUser } = useAuthState()
  const [view, setView] = useState<PopupView>('auth')

  // If user becomes authenticated (e.g., from another context), show sidebar prompt
  useEffect(() => {
    if (isAuthenticated && user) {
      setView('open-sidebar')
    }
  }, [isAuthenticated, user])

  // Show loading state while checking auth
  if (isLoading) {
    return <LoadingScreen />
  }

  // If already authenticated, show prompt to open sidebar
  if (isAuthenticated && user) {
    return <OpenSidebarPrompt user={user} />
  }

  // After successful auth, show prompt to open sidebar
  if (view === 'open-sidebar' && user) {
    return <OpenSidebarPrompt user={user} />
  }

  // Show auth screen
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    setView('open-sidebar')
  }

  return <AuthScreen onAuthSuccess={handleAuthSuccess} />
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
