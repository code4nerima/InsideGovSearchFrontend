import { useEffect, useState } from 'react'
import { css } from '../../../styled-system/css'
import { flex } from '../../../styled-system/patterns'
import Loading from '../loading'

export default function SendFeedbackBlock(props: {
  prompt: string
  keyword: string
  synonym: string
  doClear: boolean
}) {
  const { prompt, keyword, synonym, doClear } = props
  const answerOptions = [
    { value: 1, label: 'はい' },
    { value: 0, label: 'いいえ' },
  ]
  const [isAnswerSendExecuting, setIsAnswerSendExecuting] = useState(false)
  const [isAnswerResponded, setIsAnswerResponded] = useState(false)

  const sendFeedback = async (answer: number) => {
    if (answer === undefined) return
    try {
      setIsAnswerSendExecuting(true)
      await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          keywords: keyword,
          synonyms: synonym,
          answer: answer,
        }),
      })
      setIsAnswerResponded(true)
    } catch (error) {
      console.error(error)
    } finally {
      setIsAnswerSendExecuting(false)
    }
  }

  useEffect(() => {
    if (doClear) {
      setIsAnswerResponded(false)
    }
  }, [doClear])

  return (
    <div
      className={css({
        position: 'relative',
        backgroundColor: 'nerimaPale',
        padding: '18px 24px',
        borderRadius: '8px',
        color: '#000',
        marginTop: '24px',
      })}
    >
      <h2
        className={css({
          fontSize: '16px',
          fontWeight: 'normal',
          marginTop: '0',
        })}
      >
        行き先は見つかりましたか？
      </h2>
      <p className={css({ fontSize: '14px' })}>
        ※回答いただくと検索で入力いただいた文章は学習に活用されます。
      </p>
      {!isAnswerResponded ? (
        <ul className={flex({ justify: 'center' })}>
          {answerOptions.map((option, i) => (
            <li
              key={`answer-option-${i}`}
              className={css({ margin: '0 16px' })}
            >
              <button
                type="button"
                className={css({
                  appearance: 'none',
                  border: 'none',
                  width: '5em',
                  fontSize: '16px',
                  color: 'nerimaDark',
                  backgroundColor: 'white',
                  boxShadow: 'box',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  _disabled: {
                    cursor: 'wait',
                  },
                })}
                disabled={isAnswerSendExecuting}
                onClick={async () => {
                  try {
                    await sendFeedback(option.value)
                  } catch (error) {
                    console.error('Error sending feedback:', error)
                  }
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={css({ marginBottom: '0' })}>
          ご回答ありがとうございました。
        </p>
      )}
      {isAnswerSendExecuting && (
        <div
          className={flex({
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.28)',
            borderRadius: '8px',
            justify: 'center',
            align: 'center',
            zIndex: '1',
          })}
        >
          <Loading />
        </div>
      )}
    </div>
  )
}
