'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Efface l'erreur du champ en cours de saisie
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  // --- Validation des contraintes ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (isSignUp) {
      // 1. Validation de la date de naissance (Pas de date future + au moins 15 ans)
      if (!formData.birthDate) {
        newErrors.birthDate = 'La date de naissance est requise.'
      } else {
        const birthDateObj = new Date(formData.birthDate)
        const today = new Date()

        // Vérification si la date est dans le futur
        if (birthDateObj > today) {
          newErrors.birthDate = 'La date de naissance ne peut pas être dans le futur.'
        } else {
          // Calcul de l'âge exact
          let age = today.getFullYear() - birthDateObj.getFullYear()
          const monthDiff = today.getMonth() - birthDateObj.getMonth()
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
          ) {
            age--
          }

          if (age < 15) {
            newErrors.birthDate = 'Vous devez avoir au moins 15 ans pour créer un compte.'
          }
        }
      }

      // 2. Validation du mot de passe sécurisé
      // Contraintes : 8 caractères min, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&).'
      }

      // 3. Confirmation du mot de passe
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (isSignUp) {
      console.log('Inscription validée avec :', formData)
    } else {
      console.log('Connexion avec :', {
        email: formData.email,
        password: formData.password,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border bg-background p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold">
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSignUp
              ? 'Remplissez les informations ci-dessous pour créer votre compte.'
              : 'Entrez vos identifiants pour accéder à votre espace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Prénom</label>
                  <Input
                    name="firstName"
                    placeholder="Jean"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Nom</label>
                  <Input
                    name="lastName"
                    placeholder="Dupont"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Nom de l'entreprise</label>
                <Input
                  name="companyName"
                  placeholder="Acme Inc."
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-medium">Date de naissance</label>
                <Input
                  type="date"
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                />
                {errors.birthDate && (
                  <p className="mt-1 text-xs text-destructive">{errors.birthDate}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="nom@exemple.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-medium">Mot de passe</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">Confirmer le mot de passe</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="nom@exemple.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-medium">Mot de passe</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full mt-4">
            {isSignUp ? "S'inscrire" : 'Se connecter'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {isSignUp ? (
            <p>
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false)
                  setErrors({})
                }}
                className="font-semibold text-primary underline"
              >
                Se connecter
              </button>
            </p>
          ) : (
            <p>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true)
                  setErrors({})
                }}
                className="font-semibold text-primary underline"
              >
                Créer un compte
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}