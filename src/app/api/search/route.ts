import { NextRequest, NextResponse } from 'next/server'

interface CustomRequest extends NextRequest {
  prompt?: string
  useSynonyms: boolean
}

export async function POST(req: CustomRequest) {
  if (!process.env.API_URL || !process.env.API_AUTH_KEY) {
    throw new Error('API URL or Auth Key is not defined')
  }
  const body = await req.json()
  const { prompt } = body || {}
  const apiUrl = process.env.API_URL
  const data = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.API_AUTH_KEY,
    },
    body: JSON.stringify({ prompt, useSynonyms: true }),
  })
  const result = await data.json()

  return NextResponse.json(result)
}

export async function OPTIONS(request: Request) {
  const allowedOrigin = request.headers.get('origin')
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
      'Access-Control-Max-Age': '86400',
    },
  })

  return response
}
