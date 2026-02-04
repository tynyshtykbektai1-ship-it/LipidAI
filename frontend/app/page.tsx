'use client'

import { LDLPredictorForm } from '@/components/ldl-predictor-form'
import { Activity } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-10 w-10 text-primary" strokeWidth={2.5} />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              LDL-C Predictor
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Enter your blood test values to predict LDL cholesterol
          </p>
        </header>

        {/* Main Form */}
        <main>
          <LDLPredictorForm />
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold">FastAPI ML backend</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            For educational purposes only. Consult a healthcare professional for medical advice.
          </p>
        </footer>
      </div>
    </div>
  )
}
