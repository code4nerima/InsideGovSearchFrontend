import { NextResponse } from 'next/server'

export async function POST() {
  if (
    !process.env.AMI_VOICE_APPKEY_API_URL ||
    !process.env.AMI_VOICE_SERVICE_ID ||
    !process.env.AMI_VOICE_SERVICE_PASSWORD
  ) {
    throw new Error(
      'AMI_VOICE_APPKEY_API_URL or AMI_VOICE_SERVICE_ID or AMI_VOICE_SERVICE_PASSWORD is not defined'
    )
  }
  const apiUrl = process.env.AMI_VOICE_APPKEY_API_URL
  const formData = new FormData()
  formData.append('sid', process.env.AMI_VOICE_SERVICE_ID)
  formData.append('spw', process.env.AMI_VOICE_SERVICE_PASSWORD)
  const dataAsString = new URLSearchParams(
    formData as unknown as URLSearchParams
  ).toString()

  const data = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: dataAsString,
  })
  const result = await data.text()

  return NextResponse.json({ results: { appkey: result } })
}
