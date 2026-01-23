import { useState } from 'react'
import { AuthScreen } from './components/AuthScreen'

interface User {
  email: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  }

  // Placeholder for authenticated state
  return (
    <div className="w-full h-full bg-kol-bg flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-kol-green/10 border border-kol-green/20 flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-3xl text-kol-green" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-2">
          Welcome to LaunchKOL
        </h2>
        <p className="text-sm text-kol-text-tertiary font-body mb-4">
          Signed in as {user.email}
        </p>
        <button
          onClick={() => setUser(null)}
          className="text-sm text-kol-blue hover:text-kol-blue-hover font-body transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default App
