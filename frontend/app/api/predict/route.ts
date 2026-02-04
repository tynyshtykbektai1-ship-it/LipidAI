import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { tc, hdl, tg } = await request.json()

    // Validate inputs
    if (!tc || !hdl || !tg || tc <= 0 || hdl <= 0 || tg <= 0) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      )
    }

    // TODO: Replace this with actual FastAPI backend call
    // Example: const response = await fetch('YOUR_FASTAPI_URL/predict', { ... })
    
    // For now, use the Friedewald equation: LDL = TC - HDL - (TG/5)
    const ldl_c = tc - hdl - (tg / 5)
    
    // Round to 1 decimal place
    const roundedLDL = Math.round(ldl_c * 10) / 10

    return NextResponse.json({ ldl_c: roundedLDL })
  } catch (error) {
    console.error('[v0] Prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to predict LDL-C' },
      { status: 500 }
    )
  }
}
