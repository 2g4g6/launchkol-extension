import { useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'

interface User {
  email: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
  }

  const handleSignOut = () => {
    setUser(null)
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  }

  return <Dashboard user={user} onSignOut={handleSignOut} />
}

export default App
