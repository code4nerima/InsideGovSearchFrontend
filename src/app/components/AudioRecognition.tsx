// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useEffect, useState } from 'react'
import { flex } from '../../../styled-system/patterns'
import { getSanitizedText } from '../utils'
import { Recorder, Result, Wrp } from '../utils/vendor/wrp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AudioRecognition(props: {
  getRecognitionResult: any
  getStatusRecording: any
}) {
  const { getRecognitionResult, getStatusRecording } = props
  Wrp.serverURL = process.env.NEXT_PUBLIC_AMI_VOICE_WEBSOCKET_API_URL ?? ''
  Wrp.grammarFileNames = '-a-general'
  const [isAppKeyExecuting, setIsAppKeyExecuting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState('')
  const [isFontReady, setIsFontReady] = useState(false)

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Recorder.recorded = (data: any) => {
    Wrp.feedData(data)
  }

  Recorder.pauseEnded = () => {
    Wrp.disconnect()
  }

  const resumePause = async () => {
    if (Wrp.isActive()) {
      Wrp.feedDataPause()
      setIsRecording(false)
    } else {
      if (Wrp.grammarFileNames !== '') {
        setRecognitionResult('')
        setIsAppKeyExecuting(true)
        await getAppKey()
        setIsAppKeyExecuting(false)
        setIsRecording(true)
        Wrp.feedDataResume()
      }
    }
  }

  useEffect(() => {
    getRecognitionResult(recognitionResult)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognitionResult])

  useEffect(() => {
    getStatusRecording(isRecording)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording])

  useEffect(() => {
    document.fonts.ready.then(function () {
      setIsFontReady(true)
    })
  }, [])

  return (
    <div>
      <button
        type="button"
        className={flex({
          direction: 'column',
          align: 'center',
          justify: 'center',
          appearance: 'none',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          _disabled: {
            cursor: 'not-allowed',
          },
        })}
        disabled={isAppKeyExecuting}
        onClick={resumePause}
      >
        {isFontReady && (
          <span
            className={flex({
              justify: 'center',
              align: 'center',
              fontFamily: 'Material Symbols Rounded Variable',
              fontSize: '24px',
              color: isRecording ? 'white' : 'nerimaDark',
              width: '50px',
              height: '50px',
              backgroundColor: isRecording ? 'red' : 'white',
              boxShadow: 'box',
              borderRadius: '50%',
              margin: '8px',
            })}
            aria-hidden="true"
          >
            {isRecording ? 'record_voice_over' : 'mic'}
          </span>
        )}
        {isRecording ? '止める' : '話す'}
      </button>
    </div>
  )
}
