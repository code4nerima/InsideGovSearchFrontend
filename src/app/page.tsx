'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { css } from '../../styled-system/css'
import { center, flex, grid } from '../../styled-system/patterns'
import Loading from './loading'

export default function Home() {
  const resultTitleRef = useRef<HTMLHeadingElement>(null)

  const [currentPrompt, setCurrentPrompt] = useState('')
  const [results, setResults] = useState([])
  const [keyword, setKeyword] = useState('')
  const [isSearchExecuting, setIsSearchExecuting] = useState(false)
  const [isResultResponded, setIsResultResponded] = useState(false)
  const [isComposed, setIsComposed] = useState(false)

  const startComposition = () => setIsComposed(true)
  const endComposition = () => setIsComposed(false)

  const handleClick = async () => {
    try {
      setIsSearchExecuting(true)
      const data = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentPrompt }),
      })
      const result = await data.json()
      setResults(result.results.results)
      setKeyword(result.results.keywords)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearchExecuting(false)
      setIsResultResponded(true)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyDown = async (e: any) => {
    if (e.keyCode === 13 && !isComposed) {
      e.preventDefault()
      await handleClick()
    }
  }

  const excludeDisplayKeys = ['書類正式名称', 'タグ']

  useEffect(() => {
    if (isResultResponded && resultTitleRef.current) {
      resultTitleRef.current.focus()
    }
  }, [isResultResponded])

  return (
    <div
      className={css({
        minHeight: '100dvh',
        backgroundColor: 'rgba(30, 58, 138, 0.25)',
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
          minHeight: '100dvh',
        })}
      >
        <div
          className={grid({
            columns: 1,
            gridTemplateRows: 'min-content auto min-content',
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
            className={grid({
              columns: 1,
              gridTemplateRows: isResultResponded
                ? 'min-content min-content min-content'
                : 'min-content min-content 60px',
              alignSelf: 'center',
            })}
          >
            <p
              className={center({
                fontSize: '32px',
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
            <div
              className={css({ width: 'min(95%, 550px)', margin: '0 auto' })}
            >
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
                    fontSize: '24px',
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
                    fontSize: '16px',
                    width: '100%',
                    padding: '12px 70px 12px 42px',
                    border: 'none',
                    backgroundColor: 'nerimaLight',
                    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.25)',
                    _placeholder: {
                      fontFamily: '"M PLUS 2 Variable", sans-serif',
                      fontWeight: 'thin',
                      color: 'nerimaDark',
                    },
                    _disabled: {
                      cursor: 'wait',
                    },
                  })}
                  placeholder="例）引っ越ししたときの手続きをしたい"
                  disabled={isSearchExecuting}
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
                    padding: '6px',
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
                    _disabled: {
                      color: '#71717a',
                      cursor: 'wait',
                    },
                  })}
                  disabled={isSearchExecuting}
                  onClick={handleClick}
                >
                  検索
                </button>
              </div>
            </div>
            <div
              className={flex({
                direction: 'column',
                align: 'center',
                justify: 'center',
              })}
            >
              {isSearchExecuting && (
                <>
                  <Loading />
                  <p
                    aria-live="polite"
                    className={css({
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      padding: '0',
                      margin: '-1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      borderWidth: '0',
                    })}
                  >
                    検索中です
                  </p>
                </>
              )}
            </div>
          </div>
          {isResultResponded && (
            <div
              className={css({ width: 'min(95%, 550px)', margin: '0 auto' })}
            >
              <h2
                ref={resultTitleRef}
                className={css({ fontSize: '24px', fontWeight: 'normal' })}
              >
                {`検索結果（${results.length}件）`}
              </h2>
              <p>
                {`「${keyword}」で検索した結果、${results.length}件見つかりました。`}
              </p>
              <ol
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
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.75)',
                      padding: '18px 24px',
                      marginBottom: '18px',
                      borderRadius: '8px',
                      color: '#000',
                    })}
                  >
                    <h3
                      className={css({
                        fontSize: '22px',
                        fontWeight: 'normal',
                        marginTop: '0',
                      })}
                    >
                      {`${i + 1}. ${result['書類正式名称']}`}
                    </h3>
                    <dl className={css({ fontSize: '14px' })}>
                      {Object.entries(result)
                        .filter(([k]) => !excludeDisplayKeys.includes(k))
                        .map(([key, value], j) => (
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
              </ol>
            </div>
          )}
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
