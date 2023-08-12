'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { css } from '../../styled-system/css'
import { center, flex, grid } from '../../styled-system/patterns'

export default function Home() {
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [results, setResults] = useState([])
  const [composing, setComposition] = useState(false)
  const startComposition = () => setComposition(true)
  const endComposition = () => setComposition(false)

  const handleClick = async () => {
    try {
      const data = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentPrompt }),
      })
      const result = await data.json()
      setResults(result.results.results)
    } catch (error) {
      console.error(error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyDown = async (e: any) => {
    if (e.key === 'Enter' && !composing) {
      e.preventDefault()
      await handleClick()
    }
  }

  return (
    <div
      className={css({
        color: 'white',
        '& a': {
          color: 'white',
        },
      })}
    >
      <div
        className={css({
          position: 'fixed',
          height: '100dvh',
          width: '100vw',
          overflow: 'hidden',
          zIndex: '-1',
        })}
      >
        <Image
          alt=""
          src="/images/bg.webp"
          fill
          sizes="100vw"
          style={{
            objectFit: 'cover',
          }}
        />
      </div>
      <div
        className={grid({
          columns: 1,
          gridTemplateRows: 'auto min-content',
          height: '100dvh',
        })}
      >
        <div
          className={grid({
            columns: 1,
            gridTemplateRows: 'auto min-content',
            gap: '18px',
            margin: 'min(4vw, 60px)',
            padding: 'min(4vw, 40px)',
            border: '1px solid white',
            borderRadius: '7vw',
          })}
        >
          <h1
            className={css({
              fontSize: 'clamp(18px, (1rem + 5vw), 24px)',
              fontWeight: 'normal',
              marginTop: '0',
            })}
          >
            練馬区届出・手続きガイド
          </h1>
          <div
            className={flex({
              flexDirection: 'column',
              align: 'center',
              justify: 'center',
            })}
          >
            <p
              className={center({
                fontSize: '2rem',
                textShadow: 'default',
                animation:
                  'FloatHorizontal 7.0s ease-in-out infinite alternate',
              })}
            >
              <span
                className={css({
                  animation:
                    'FloatVertical 6.0s ease-in-out infinite alternate',
                })}
              >
                あなたが知りたいことはなんですか？
              </span>
            </p>
            <div className={css({ width: 'min(95%, 550px)' })}>
              <label
                htmlFor="prompt"
                className={css({ display: 'block', marginBottom: '12px' })}
              >
                知りたいことを文章で書いてみてください
              </label>
              <div
                className={flex({
                  position: 'relative',
                  align: 'center',
                  justify: 'center',
                  _before: {
                    content: '"search"',
                    fontFamily: 'Material Symbols Rounded Variable',
                    fontSize: '30px',
                    color: 'nerimaDark',
                    position: 'absolute',
                    left: '12px',
                  },
                })}
              >
                <input
                  id="prompt"
                  type="text"
                  className={css({
                    borderRadius: '3em',
                    fontSize: '18px',
                    width: '100%',
                    padding: '12px 76px 12px 48px',
                    border: 'none',
                    backgroundColor: 'nerimaLight',
                    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.25)',
                    _placeholder: {
                      fontFamily: '"M PLUS 2 Variable", sans-serif',
                      fontWeight: 'thin',
                      color: 'nerimaDark',
                    },
                  })}
                  placeholder="例）引っ越ししたときの手続きをしたい"
                  onCompositionStart={startComposition}
                  onCompositionEnd={endComposition}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className={css({
                    appearance: 'none',
                    border: 'none',
                    background: 'none',
                    position: 'absolute',
                    right: '12px',
                    width: 'max-content',
                    textAlign: 'center',
                    color: 'nerimaDark',
                    fontSize: '18px',
                    cursor: 'pointer',
                    _before: {
                      backgroundColor: 'nerimaDark',
                      content: '""',
                      display: 'block',
                      width: '1px',
                      height: '24px',
                      position: 'absolute',
                      bottom: '0',
                      top: '0',
                      left: '0',
                      margin: 'auto',
                    },
                  })}
                  onClick={handleClick}
                >
                  検索
                </button>
              </div>
            </div>
            h
          </div>
          <ul
            className={flex({
              flexDirection: 'column',
              align: 'center',
              justify: 'center',
            })}
          >
            {results.map((result, i) => (
              <li
                key={`result-${i}`}
                className={css({
                  width: 'min(80%, 500px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  padding: '18px 24px',
                  marginBottom: '18px',
                  borderRadius: '8px',
                  color: '#000',
                })}
              >
                <dl>
                  {Object.entries(result).map(([key, value], j) => (
                    <React.Fragment key={`result-${j}`}>
                      <dt
                        className={css({
                          float: 'left',
                          marginRight: '16px',
                          _after: { content: '" : "' },
                        })}
                      >
                        {key}
                      </dt>
                      <dd>{value as string}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </div>
        <footer className={css({ padding: '0 18px' })}>
          <p>
            航空写真、練馬区、
            <Link href="https://creativecommons.org/licenses/by/4.0/deed.ja">
              クリエイティブ・コモンズ・ライセンス表示 4.0 国際
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
