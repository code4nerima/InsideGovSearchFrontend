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
  isSearchExecuting: boolean
  doClear: boolean
}) {
  const {
    getRecognitionResult,
    getStatusRecording,
    isSearchExecuting,
    doClear,
  } = props
  Wrp.serverURL = process.env.NEXT_PUBLIC_AMI_VOICE_WEBSOCKET_API_URL ?? ''
  Wrp.grammarFileNames = '-a-general'
  const [isAppKeyExecuting, setIsAppKeyExecuting] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState('')
  const [isFontReady, setIsFontReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTimerStarted, setIsTimerStarted] = useState(false)

  Wrp.setRecorder(Recorder)

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
      : ''
    setRecognitionResult(text)
    setIsDetecting(false)
  }

  Wrp.feedDataResumeEnded = () => {
    setIsAppKeyExecuting(false)
    setIsTalking(true)
  }

  // Wrp.TRACE = (message: string) => {
  //   console.log('TRACE', message)
  // }

  const resumePause = async () => {
    if (Wrp.isActive()) {
      Wrp.feedDataPause()
      setIsTimerStarted(false)
    } else {
      if (Wrp.grammarFileNames !== '') {
        setRecognitionResult('')
        setErrorMessage('')
        setIsAppKeyExecuting(true)
        await getAppKey()
        await Wrp.feedDataResume()
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
    if (isSearchExecuting) {
      Wrp.feedDataPause()
      setIsDetecting(false)
      setIsTalking(false)
      setIsTimerStarted(false)
    }
  }, [isSearchExecuting])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerStarted])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (errorMessage !== '') {
        setErrorMessage('')
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [errorMessage])

  useEffect(() => {
    document.fonts.ready.then(function () {
      setIsFontReady(true)
    })
  }, [])

  return (
    <div className={flex({ direction: 'column', align: 'center' })}>
      <button
        type="button"
        aria-live="polite"
        className={flex({
          direction: 'column',
          align: 'center',
          justify: 'center',
          appearance: 'none',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          whiteSpace: 'pre-wrap',
          _disabled: {
            cursor: 'not-allowed',
            '& span': { backgroundColor: '#c9c9c9', color: 'white' },
          },
        })}
        disabled={isAppKeyExecuting || isSearchExecuting}
        onClick={resumePause}
      >
        {isFontReady && (
          <span
            className={flex({
              justify: 'center',
              align: 'center',
              fontFamily: 'Material Symbols Rounded Variable',
              fontSize: '24px',
              color:
                isAppKeyExecuting || isSearchExecuting
                  ? 'white'
                  : isTalking
                  ? isDetecting
                    ? 'white'
                    : 'nerimaDark'
                  : 'nerimaDark',
              width: '50px',
              height: '50px',
              backgroundColor:
                isAppKeyExecuting || isSearchExecuting
                  ? '#c9c9c9'
                  : isTalking
                  ? isDetecting
                    ? '#ed0000'
                    : '#faff7c'
                  : 'white',
              boxShadow: 'box',
              borderRadius: '50%',
              margin: '8px',
            })}
            aria-hidden="true"
          >
            {isAppKeyExecuting || isSearchExecuting
              ? 'hourglass_empty'
              : isTalking
              ? isDetecting
                ? 'mic_off'
                : 'record_voice_over'
              : 'mic'}
          </span>
        )}
        {isAppKeyExecuting || isSearchExecuting
          ? 'お待ちください'
          : isTalking
          ? isDetecting
            ? 'キャンセル'
            : '用件をお話しください'
          : `音声入力\n（タップしたら用件を話す）`}
      </button>
      {errorMessage && (
        <p
          aria-live="polite"
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
