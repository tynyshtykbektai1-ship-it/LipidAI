'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Activity, Download } from 'lucide-react'
import { generateWordReport } from '@/lib/generate-report'

interface FormData {
  tc: string
  hdl: string
  tg: string
}

export function LDLPredictorForm() {
  const [formData, setFormData] = useState<FormData>({
    tc: '',
    hdl: '',
    tg: '',
  })
  const [result, setResult] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isDownloading, setIsDownloading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}
    
    if (!formData.tc || Number(formData.tc) <= 0) {
      newErrors.tc = 'Please enter a valid TC value'
    }
    if (!formData.hdl || Number(formData.hdl) <= 0) {
      newErrors.hdl = 'Please enter a valid HDL-C value'
    }
    if (!formData.tg || Number(formData.tg) <= 0) {
      newErrors.tg = 'Please enter a valid TG value'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Simulating API call - replace with actual FastAPI endpoint
      const response = await fetch('https://tynyshtyk-LipidAI.hf.space/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          TC: Number(formData.tc),
          HDL_C: Number(formData.hdl),
          TG: Number(formData.tg),
        }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setResult(data["LDL-C"])
    } catch (error) {
      console.error('[v0] Error predicting LDL-C:', error)
      // For demo purposes, use Friedewald equation: LDL = TC - HDL - (TG/5)
      const calculatedLDL = Number(formData.tc) - Number(formData.hdl) - (Number(formData.tg) / 5)
      setResult(Math.round(calculatedLDL * 10) / 10)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Replace comma with dot for Russian keyboard layout
    value = value.replace(',', '.')
    
    // Only allow numbers and single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }
  }

  const getLDLCategory = (ldl: number): { label: string; color: string; bgColor: string } => {
    if (ldl < 100) {
      return { label: 'Optimal', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' }
    } else if (ldl < 130) {
      return { label: 'Near Optimal', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' }
    } else if (ldl < 160) {
      return { label: 'Borderline High', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' }
    } else if (ldl < 190) {
      return { label: 'High', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' }
    } else {
      return { label: 'Very High', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' }
    }
  }

  const handleDownloadReport = async () => {
    if (result === null) return

    setIsDownloading(true)
    try {
      const reportData = {
        tc: Number(formData.tc),
        hdl: Number(formData.hdl),
        tg: Number(formData.tg),
        ldlResult: result,
        category: getLDLCategory(result).label,
        date: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      const blob = await generateWordReport(reportData)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `LDL-C_Report_${new Date().toISOString().split('T')[0]}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('[v0] Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700">
      <Card className="p-6 md:p-8 shadow-lg border-2 transition-all hover:shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tc" className="text-sm font-medium flex items-center gap-2">
                TC (Total Cholesterol)
                <span className="text-xs text-muted-foreground font-normal">mg/dL</span>
              </Label>
              <Input
                id="tc"
                type="text"
                inputMode="decimal"
                placeholder="e.g., 200.5"
                value={formData.tc}
                onChange={handleInputChange('tc')}
                className={`transition-all duration-200 focus:scale-[1.01] ${
                  errors.tc ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                aria-describedby="tc-description"
              />
              {errors.tc && <p className="text-sm text-red-600 animate-in fade-in slide-in-from-top-1">{errors.tc}</p>}
              <p id="tc-description" className="text-xs text-muted-foreground">
                Total amount of cholesterol in your blood
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hdl" className="text-sm font-medium flex items-center gap-2">
                HDL-C (Good Cholesterol)
                <span className="text-xs text-muted-foreground font-normal">mg/dL</span>
              </Label>
              <Input
                id="hdl"
                type="text"
                inputMode="decimal"
                placeholder="e.g., 50.3"
                value={formData.hdl}
                onChange={handleInputChange('hdl')}
                className={`transition-all duration-200 focus:scale-[1.01] ${
                  errors.hdl ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                aria-describedby="hdl-description"
              />
              {errors.hdl && <p className="text-sm text-red-600 animate-in fade-in slide-in-from-top-1">{errors.hdl}</p>}
              <p id="hdl-description" className="text-xs text-muted-foreground">
                High-density lipoprotein, helps remove cholesterol
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tg" className="text-sm font-medium flex items-center gap-2">
                TG (Triglycerides)
                <span className="text-xs text-muted-foreground font-normal">mg/dL</span>
              </Label>
              <Input
                id="tg"
                type="text"
                inputMode="decimal"
                placeholder="e.g., 150.7"
                value={formData.tg}
                onChange={handleInputChange('tg')}
                className={`transition-all duration-200 focus:scale-[1.01] ${
                  errors.tg ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                aria-describedby="tg-description"
              />
              {errors.tg && <p className="text-sm text-red-600 animate-in fade-in slide-in-from-top-1">{errors.tg}</p>}
              <p id="tg-description" className="text-xs text-muted-foreground">
                Type of fat found in your blood
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-5 w-5" />
                Predict LDL-C
              </>
            )}
          </Button>
        </form>
      </Card>

      {result !== null && (
        <Card className={`p-6 md:p-8 shadow-lg border-2 animate-in fade-in slide-in-from-bottom-3 duration-500 ${getLDLCategory(result).bgColor}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className={`h-6 w-6 ${getLDLCategory(result).color}`} />
              <h3 className="text-lg font-semibold text-foreground">Prediction Result</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your predicted LDL-C level is:</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-5xl font-bold ${getLDLCategory(result).color}`}>
                  {result}
                </p>
                <p className="text-2xl text-muted-foreground">mg/dL</p>
              </div>
              
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLDLCategory(result).color} bg-background/50 border`}>
                {getLDLCategory(result).label}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium text-foreground">Reference Ranges:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{'<'}100: Optimal</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span>100-129: Near Optimal</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>130-159: Borderline High</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>160-189: High</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>{'≥'}190: Very High</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground pt-2 italic">
              Note: This is an estimate. Please consult with your healthcare provider for medical advice.
            </p>

            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="w-full mt-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-transparent"
              variant="outline"
              size="lg"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Report (Word)
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
