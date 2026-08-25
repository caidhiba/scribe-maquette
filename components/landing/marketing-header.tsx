// import Link from 'next/link'
// import { ScribeLogo } from '@/components/scribe-logo'
// import { Button } from '@/components/ui/button'

// export function MarketingHeader() {
//   return (
//     <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
//       <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
//         <Link href="/" aria-label="Scribe home">
//           <ScribeLogo />
//         </Link>
//         <nav className="hidden items-center gap-8 md:flex">
//           <a href="#modes" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
//             Capture modes
//           </a>
//           <a href="#how" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
//             How it works
//           </a>
//           <a href="#privacy" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
//             Privacy
//           </a>
//         </nav>
//         <div className="flex items-center gap-2">
//         <Link href="/dashboard" className="hidden sm:inline-flex">
//           <Button variant="ghost">Sign in</Button>
//         </Link>
//         <Link href="/dashboard">
//           <Button>Open app</Button>
//         </Link>
//           </div>
       
//       </div>
//     </header>
//   )
// }


'use client'

import { useState } from 'react'
import { AuthModal } from '@/components/auth/auth-modal'
import { Button } from '@/components/ui/button'

export function MarketingHeader() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')

  const openSignIn = () => {
    setAuthMode('signin')
    setIsAuthOpen(true)
  }

  const openSignUp = () => {
    setAuthMode('signup')
    setIsAuthOpen(true)
  }

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <span className="font-bold text-lg">Scribe</span>
        <div className="flex items-center gap-3">
          {/* Clic sur Sign in -> Ouvre en mode connexion */}
          <Button variant="ghost" onClick={openSignIn}>
            Sign in
          </Button>

          {/* Clic sur Start a capture -> Ouvre en mode inscription */}
          <Button onClick={openSignUp}>
            Start a capture
          </Button>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  )
}