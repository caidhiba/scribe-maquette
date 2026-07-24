// 

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Pause, Play, Square, Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatClock } from '@/lib/mock-data'

// URL du Webhook n8n
const N8N_WEBHOOK_URL = 'https://dcbd4caef49cdb.lhr.lifea7c353'

type Phase = 'idle' | 'recording' | 'paused' | 'processing' | 'done' | 'error'

export function DictaphoneRecorder({ title, onBack }: { title: string; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Références pour la gestion de l'audio et du timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Compteur de temps d'enregistrement
  useEffect(() => {
    if (phase === 'recording') {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Lancer l'enregistrement du micro
  const startRecording = async () => {
    try {
      setErrorMessage(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setPhase('recording')
    } catch (err) {
      console.error("Erreur d'accès au microphone :", err)
      setErrorMessage("Impossible d'accéder au microphone. Vérifiez vos permissions.")
      setPhase('error')
    }
  }

  // Mettre en pause l'enregistrement
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setPhase('paused')
    }
  }

  // Reprendre l'enregistrement
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setPhase('recording')
    }
  }

  // Arrêter et envoyer l'audio au Webhook n8n
  const stopAndTranscribe = () => {
    if (!mediaRecorderRef.current) return

    setPhase('processing')

    mediaRecorderRef.current.onstop = async () => {
      // 1. Création du fichier Blob Audio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })

      // 2. Préparation du FormData
      const formData = new FormData()
      formData.append('file', audioFile)
      formData.append('title', title)
      formData.append('participants', '1') // Valeur par défaut ou dynamique selon tes besoins

      // 3. Envoi vers le Webhook n8n
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`)
        }

        // On arrête toutes les pistes du micro pour libérer le matériel
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop())

        setPhase('done')
      } catch (error) {
        console.error("Erreur lors de l'envoi vers n8n :", error)
        setErrorMessage("L'envoi vers n8n a échoué. Vérifiez l'URL du Webhook ou le serveur.")
        setPhase('error')
      }
    }

    mediaRecorderRef.current.stop()
  }

  const isRecording = phase === 'recording'

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Mic className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold leading-tight">{title}</h2>
                <p className="text-xs text-muted-foreground">Dictaphone mode</p>
              </div>
            </div>
            {isRecording && (
              <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                Recording
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer + waveform */}
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-secondary/40 py-8">
            <span className="font-mono text-5xl tabular-nums tracking-tight">{formatClock(seconds)}</span>
            <Waveform active={isRecording} />
            <p className="text-xs text-muted-foreground">
              {phase === 'idle' && 'Ready to record from your microphone'}
              {phase === 'recording' && 'Capturing audio — long sessions are handled automatically'}
              {phase === 'paused' && 'Paused'}
              {phase === 'processing' && 'Sending audio to n8n webhook & transcribing…'}
              {phase === 'done' && 'Transcription dispatched successfully!'}
              {phase === 'error' && errorMessage}
            </p>
          </div>

          {/* Controls */}
          {phase !== 'processing' && phase !== 'done' && (
            <div className="flex items-center justify-center gap-3">
              {(phase === 'idle' || phase === 'error') && (
                <Button size="lg" className="gap-2" onClick={startRecording}>
                  <Mic className="h-4 w-4" />
                  Start recording
                </Button>
              )}
              {phase === 'recording' && (
                <>
                  <Button size="lg" variant="outline" className="gap-2" onClick={pauseRecording}>
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                  <Button size="lg" variant="destructive" className="gap-2" onClick={stopAndTranscribe}>
                    <Square className="h-4 w-4" />
                    Stop & transcribe
                  </Button>
                </>
              )}
              {phase === 'paused' && (
                <>
                  <Button size="lg" className="gap-2" onClick={resumeRecording}>
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                  <Button size="lg" variant="destructive" className="gap-2" onClick={stopAndTranscribe}>
                    <Square className="h-4 w-4" />
                    Stop & transcribe
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Processing State */}
          {phase === 'processing' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              Sending recording to n8n workflow...
            </div>
          )}

          {/* Success State */}
          {phase === 'done' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-chart-2/10 p-4 text-sm text-chart-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Audio sent to n8n! Check your workflow to view the generated transcription and report.</span>
              </div>

              <Link href="/meetings" className="w-full">
              <Button size="lg" className="w-full gap-2">
                View meetings list
                <ArrowRight className="h-4 w-4" />
              </Button>
              </Link>
            </div>
          )}

          {/* Error Display */}
          {phase === 'error' && errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Waveform({ active }: { active: boolean }) {
  const bars = 40
  return (
    <div className="flex h-12 items-center gap-1" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-brand/70"
          style={{
            height: active ? `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%` : '12%',
            animation: active ? `wave 1s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`@keyframes wave { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}