import { NextRequest, NextResponse } from 'next/server'

interface CustomRequest extends NextRequest {
  prompt?: string
  keywords?: string
  synonyms?: string
  answer: number
}

export async function POST(req: CustomRequest) {
  if (!process.env.UPLOAD_API_URL || !process.env.API_AUTH_KEY) {
    throw new Error('API URL or Auth Key is not defined')
  }
  const body = await req.json()
  const { prompt, keywords, synonyms, answer } = body || {}
  const apiUrl = process.env.UPLOAD_API_URL
  const data = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.API_AUTH_KEY,
    },
    body: JSON.stringify({ prompt, keywords, synonyms, answer }),
  })
  const result = await data.json()

  return NextResponse.json(result)
}
