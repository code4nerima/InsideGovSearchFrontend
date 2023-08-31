// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useEffect, useState } from 'react'
import { css } from '../../../styled-system/css'
import { flex } from '../../../styled-system/patterns'
import { getSanitizedText } from '../utils'
import { Recorder, Result, Wrp } from '../utils/vendor/wrp'

export default function AudioRecognition(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRecognitionResult: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStatusRecording: any
  doClear: boolean
}) {
  const { getRecognitionResult, getStatusRecording, doClear } = props
  Wrp.serverURL = process.env.NEXT_PUBLIC_AMI_VOICE_WEBSOCKET_API_URL ?? ''
  Wrp.grammarFileNames = '-a-general'
  const [isAppKeyExecuting, setIsAppKeyExecuting] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState('')
  const [isFontReady, setIsFontReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTimerStarted, setIsTimerStarted] = useState(false)

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
    setIsTimerStarted(true)
  }

  Wrp.feedDataPauseEnded = () => {
    Recorder.pause()
  }

  Wrp.resultCreated = () => {
    setIsDetecting(true)
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
    setIsDetecting(false)
  }

  // Wrp.TRACE = (message: string) => {
  //   console.log('TRACE', message)
  // }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Recorder.recorded = (data: any) => {
    Wrp.feedData(data)
  }

  Recorder.pauseEnded = () => {
    setIsTalking(false)
    Wrp.disconnect()
  }

  const resumePause = async () => {
    if (Wrp.isActive()) {
      Wrp.feedDataPause()
    } else {
      if (Wrp.grammarFileNames !== '') {
        setRecognitionResult('')
        setErrorMessage('')
        setIsAppKeyExecuting(true)
        await getAppKey()
        setIsAppKeyExecuting(false)
        setIsTalking(true)
        Wrp.feedDataResume()
      }
    }
  }

  useEffect(() => {
    getRecognitionResult(recognitionResult)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognitionResult])

  useEffect(() => {
    getStatusRecording(isDetecting)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetecting])

  useEffect(() => {
    if (doClear) {
      setErrorMessage('')
      setIsTimerStarted(false)
    }
  }, [doClear])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTimerStarted && !isDetecting) {
        Wrp.feedDataPause()
        setIsDetecting(false)
        setIsTalking(false)
        setErrorMessage('音声認識に失敗しました')
        setIsTimerStarted(false)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [isTimerStarted, isDetecting])

  useEffect(() => {
    document.fonts.ready.then(function () {
      setIsFontReady(true)
    })
  }, [])

  return (
    <div className={flex({ direction: 'column', align: 'center' })}>
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
              color: isTalking
                ? isDetecting
                  ? 'white'
                  : 'nerimaDark'
                : 'nerimaDark',
              width: '50px',
              height: '50px',
              backgroundColor: isTalking
                ? isDetecting
                  ? 'red'
                  : 'white'
                : 'white',
              boxShadow: 'box',
              borderRadius: '50%',
              margin: '8px',
            })}
            aria-hidden="true"
          >
            {isTalking
              ? isDetecting
                ? 'mic_off'
                : 'record_voice_over'
              : 'mic'}
          </span>
        )}
        {isTalking ? (isDetecting ? 'キャンセル' : '話す') : '話す'}
      </button>
      {errorMessage && (
        <p
          className={css({
            color: 'white',
            padding: '4px 12px',
            backgroundColor: 'rgba(255, 0, 0, 0.6)',
            borderRadius: '4px',
          })}
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
