import { useState } from 'react'
import { getSanitizedText } from '../utils'
import { Recorder, Result, Wrp } from '../utils/vendor/wrp'

export default function AudioRecognition() {
  Wrp.serverURL = process.env.NEXT_PUBLIC_AMI_VOICE_WEBSOCKET_API_URL ?? ''
  Wrp.grammarFileNames = '-a-general'
  const [isAppKeyExecuting, setIsAppKeyExecuting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState('')

  const getAppKey = async () => {
    try {
      const res = await fetch('/api/amiVoiceAuth', {
        method: 'POST',
      }).then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        return res
      })
      const data = await res.json()
      Wrp.authorization = data.results.appkey
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error', error.message)
      } else {
        console.log('Error')
      }
    }
  }

  Wrp.feedDataResumeEnded = () => {
    Recorder.resume()
  }

  Wrp.feedDataPauseEnded = () => {
    Recorder.pause()
  }

  Wrp.resultUpdated = (res: typeof Result) => {
    const result = Result.parse(res)
    const text = result.text ? getSanitizedText(result.text) : '...'
    setRecognitionResult(text)
  }

  Wrp.resultFinalized = (res: typeof Result) => {
    const result = Result.parse(res)
    const text = result.text
      ? getSanitizedText(result.text)
      : result.code != 'o' && result.message
      ? '(' + result.message + ')'
      : '(なし)'
    setRecognitionResult(text)
  }

  // Wrp.TRACE = (message: string) => {
  //   console.log('TRACE', message)
  // }

  Recorder.recorded = (data: any) => {
    Wrp.feedData(data)
  }

  Recorder.pauseEnded = () => {
    Wrp.disconnect()
  }

  const resumePause = async () => {
    setIsAppKeyExecuting(true)
    await getAppKey()
    setIsAppKeyExecuting(false)
    if (Wrp.isActive()) {
      Wrp.feedDataPause()
      setIsRecording(false)
    } else {
      if (Wrp.grammarFileNames !== '') {
        setRecognitionResult('')
        setIsRecording(true)
        Wrp.feedDataResume()
      }
    }
  }

  return (
    <div>
      <button type="button" disabled={isAppKeyExecuting} onClick={resumePause}>
        {isRecording ? '止める' : '話す'}
      </button>
      <div>{recognitionResult}</div>
    </div>
  )
}
