'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { css } from '../../styled-system/css'
import { center, flex, grid } from '../../styled-system/patterns'
import Loading from './loading'
import {
  GroupByKeyObject,
  getConcatResults,
  getGroupByKeysRecursive,
} from './utils'

export default function Home() {
  const searchParams = useSearchParams()
  const debug = searchParams.get('debug')
  const resultTitleRef = useRef<HTMLHeadingElement>(null)

  const groupByKeys = ['場所種別', '担当課', '担当係']
  const excludeDisplayKeys = [
    '手続名称',
    '書類正式名称',
    '書類略称',
    'タグ',
    '場所種別',
    '内線番号',
    'score',
    'deviationValue',
  ]
  const concatDisplayKeys = ['担当課', '担当係', '場所']
  const answerOptions = [
    { value: 1, label: 'はい' },
    { value: 0, label: 'いいえ' },
  ]
  const limitSelectOptions = [
    {
      value: 5,
      label: '選りすぐりモード',
    },
    {
      value: -1,
      label: '寄せ集めモード',
    },
  ]

  const [currentPrompt, setCurrentPrompt] = useState('')
  const [results, setResults] = useState([])
  const [resultsGroupBy, setResultsGroupBy] = useState<Array<GroupByKeyObject>>(
    []
  )
  const [keyword, setKeyword] = useState('')
  const [synonym, setSynonym] = useState('')
  const [suggestedPrompts, setSuggestedPrompts] = useState([])
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [selectedLimit, setSelectedLimit] = useState(0)
  const [isSearchExecuting, setIsSearchExecuting] = useState(false)
  const [isResultResponded, setIsResultResponded] = useState(false)
  const [isSuggestedPromptResponded, setIsSuggestedPromptResponded] =
    useState(false)
  const [isComposed, setIsComposed] = useState(false)
  const [isAnswerSendExecuting, setIsAnswerSendExecuting] = useState(false)
  const [isAnswerResponded, setIsAnswerResponded] = useState(false)
  const [isFontReady, setIsFontReady] = useState(false)

  const startComposition = () => setIsComposed(true)
  const endComposition = () => setIsComposed(false)

  const handleSearch = async (prompt: string) => {
    if (currentPrompt === '') return
    try {
      setIsSearchExecuting(true)
      handleReset()
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt, limit: selectedLimit }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        return res
      })
      const data = await res.json()
      const results = data.results.results
      setResults(results)
      const groupBy = getGroupByKeysRecursive(results, groupByKeys)
      setResultsGroupBy(groupBy)
      setKeyword(data.results.keywords)
      setSynonym(data.results.synonyms)
      setIsResultResponded(true)
      setIsSearchExecuting(false)
      await suggestPrompt()
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error', error.message)
      } else {
        console.log('Error')
      }
    } finally {
      setIsResultResponded(true)
      setIsSearchExecuting(false)
    }
  }

  const suggestPrompt = async () => {
    try {
      const res = await fetch('/api/promptVariations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentPrompt }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        return res
      })
      const data = await res.json()
      setSuggestedPrompts(data.promptVariations.variations)
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error', error.message)
      } else {
        console.log('Error')
      }
    } finally {
      setIsSuggestedPromptResponded(true)
    }
  }

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
          prompt: currentPrompt,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyDown = async (e: any) => {
    if (e.keyCode === 13 && !isComposed) {
      e.preventDefault()
      await handleSearch(currentPrompt)
    }
  }

  const handleReset = () => {
    setResults([])
    setResultsGroupBy([])
    setKeyword('')
    setSynonym('')
    setSuggestedPrompts([])
    setSelectedPrompt('')
    setIsResultResponded(false)
    setIsSuggestedPromptResponded(false)
    setIsAnswerResponded(false)
  }

  const handleClearAll = () => {
    setCurrentPrompt('')
    handleReset()
  }

  const handleChangePrompt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPrompt(e.target.value)
    setCurrentPrompt(e.target.value)
    await handleSearch(e.target.value)
  }

  useEffect(() => {
    setSelectedLimit(5)
    document.fonts.ready.then(function () {
      setIsFontReady(true)
    })
  }, [])

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
      })}
    >
      <div
        className={css({
          position: 'fixed',
          height: '100%',
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
            gridTemplateRows: 'min-content auto',
            gap: '18px',
            margin: 'min(4vw, 60px)',
            padding: 'min(4vw, 40px)',
            border: '1px solid white',
            borderRadius: 'min(7vw, 50px)',
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
              gridTemplateRows: 'repeat(min-content)',
              alignSelf: 'center',
            })}
          >
            <div
              className={css({
                marginTop: '-30px',
                transform:
                  isResultResponded || isSuggestedPromptResponded
                    ? 'translateY(0)'
                    : 'translateY(25%)',
                transition: 'transform 0.5s cubic-bezier(.37,.24,.55,1)',
              })}
            >
              <p
                className={center({
                  fontSize: '32px',
                  textShadow: 'default',
                  letterSpacing: '2px',
                  margin: '16px 0',
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
                  ご用件はなんですか？
                </span>
              </p>
            </div>
            <div
              className={css({
                position: 'sticky',
                top: '0',
                zIndex: '99',
                width: 'min(97%, 650px)',
                margin: '0 auto',
                padding: '18px',
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
                borderRadius: '8px',
                transform:
                  isResultResponded || isSuggestedPromptResponded
                    ? 'translateY(0)'
                    : 'translateY(25%)',
                transition: 'transform 0.5s cubic-bezier(.37,.24,.55,1)',
              })}
            >
              <label
                htmlFor="prompt"
                className={css({ display: 'block', marginBottom: '12px' })}
              >
                用件を文章で書いてみてください
              </label>
              <div
                className={flex({
                  position: 'relative',
                  align: 'center',
                  justify: 'center',
                  marginBottom: '14px',
                })}
              >
                {isFontReady && (
                  <span
                    className={css({
                      fontFamily: 'Material Symbols Rounded Variable',
                      fontSize: '24px',
                      color: 'nerimaDark',
                      position: 'absolute',
                      left: '12px',
                    })}
                    aria-hidden="true"
                  >
                    search
                  </span>
                )}
                <input
                  id="prompt"
                  type="search"
                  className={css({
                    appearance: 'none',
                    borderRadius: '3em',
                    fontSize: '16px',
                    width: '100%',
                    padding: '12px 70px 12px 42px',
                    border: 'none',
                    backgroundColor: 'nerimaLight',
                    boxShadow: 'box',
                    _placeholder: {
                      fontFamily: '"M PLUS 2 Variable", sans-serif',
                      fontWeight: 'thin',
                      color: 'nerimaDark',
                    },
                    _disabled: {
                      cursor: 'wait',
                    },
                  })}
                  value={currentPrompt}
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
                      color: '#919191',
                      cursor: 'wait',
                    },
                  })}
                  disabled={isSearchExecuting}
                  onClick={() => handleSearch(currentPrompt)}
                >
                  検索
                </button>
              </div>
              <ul className={flex({ wrap: 'wrap', margin: '12px 0' })}>
                {limitSelectOptions.map((option, i) => (
                  <li
                    key={`limit-select-${i}`}
                    className={css({ margin: '0 18px 12px 0' })}
                  >
                    <input
                      type="radio"
                      className={css({
                        marginRight: '8px',
                        cursor: 'pointer',
                        _checked: {
                          backgroundColor: 'red',
                        },
                      })}
                      id={`limit-select-id-${i}`}
                      name="limit-select"
                      value={option.value}
                      checked={selectedLimit === option.value}
                      onChange={() => setSelectedLimit(option.value)}
                    />
                    <label
                      htmlFor={`limit-select-id-${i}`}
                      className={css({ cursor: 'pointer' })}
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={css({
                  appearance: 'none',
                  border: 'none',
                  fontSize: '14px',
                  backgroundColor: 'nerimaPale',
                  boxShadow: 'box',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  _disabled: {
                    color: '#919191',
                    backgroundColor: '#f7f7f7',
                    cursor: 'not-allowed',
                  },
                })}
                disabled={
                  isSearchExecuting ||
                  (!isSuggestedPromptResponded && isResultResponded) ||
                  (currentPrompt === '' && !isResultResponded)
                }
                onClick={handleClearAll}
              >
                検索をリセット
              </button>
            </div>
            <div
              className={css({
                transform:
                  isResultResponded || isSuggestedPromptResponded
                    ? 'translateY(0)'
                    : 'translateY(25%)',
                transition: 'transform 0.5s cubic-bezier(.37,.24,.55,1)',
              })}
            >
              <div
                className={flex({
                  direction: 'column',
                  align: 'center',
                  justify: 'center',
                  height:
                    isSearchExecuting && !isResultResponded ? '80px' : '0',
                })}
              >
                {isSearchExecuting && !isResultResponded && (
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
            {isSuggestedPromptResponded ? (
              <div
                className={css({
                  width: 'min(97%, 650px)',
                  margin: '0 auto',
                })}
              >
                <div
                  className={css({
                    backgroundColor: 'nerimaPale',
                    padding: '18px 24px',
                    borderRadius: '8px',
                    color: '#000',
                  })}
                >
                  <h2
                    className={css({
                      display: 'inline',
                      fontSize: '22px',
                      fontWeight: 'normal',
                      marginTop: '0',
                      padding: '0 4px',
                      background:
                        'linear-gradient(to bottom, transparent 0%, transparent 65%, rgba(77,166,53, 0.3) 65%, rgba(77,166,53, 0.3) 100%)',
                    })}
                  >
                    もし行き先が見つからなかったら
                  </h2>
                  <p>こちらの質問文で再度試してみてください。</p>
                  <ul>
                    {suggestedPrompts.map((prompt, i) => (
                      <li
                        key={`suggested-prompt-${i}`}
                        className={css({ marginBottom: '12px' })}
                      >
                        <input
                          type="radio"
                          className={css({
                            marginRight: '8px',
                            cursor: 'pointer',
                          })}
                          id={`suggested-prompt-id-${i}`}
                          name="suggested-prompt"
                          value={prompt}
                          checked={selectedPrompt === prompt}
                          onChange={handleChangePrompt}
                        />
                        <label
                          htmlFor={`suggested-prompt-id-${i}`}
                          className={css({ cursor: 'pointer' })}
                        >
                          {prompt}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              isResultResponded && (
                <div
                  className={flex({
                    align: 'center',
                    justify: 'center',
                    width: 'min(97%, 650px)',
                    padding: '30px 0',
                    margin: '0 auto',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                    opacity: '0.75',
                  })}
                >
                  <Loading />
                </div>
              )
            )}
            {isResultResponded && (
              <div
                className={css({ width: 'min(97%, 650px)', margin: '0 auto' })}
              >
                <h2
                  ref={resultTitleRef}
                  aria-label={`検索結果${results.length}件`}
                  className={css({
                    fontSize: '24px',
                    fontWeight: 'normal',
                    _focusVisible: { outline: 'none' },
                  })}
                  tabIndex={0}
                >
                  <span aria-hidden="true">
                    <span>検索結果</span>
                    <span
                      className={css({ fontSize: '1.5em', padding: '0 8px' })}
                    >
                      {results.length}
                    </span>
                    <span className={css({ fontSize: '0.7em' })}>件</span>
                  </span>
                </h2>
                {results.length > 0 && (
                  <p>
                    {`「${keyword}」${
                      debug === '1' ? `「${synonym}」` : ''
                    }で検索した結果、${
                      results.length
                    }件の手続きが見つかりました。受付窓口へお越しください。`}
                  </p>
                )}
                {results.length > 0 && (
                  <div
                    className={css({
                      color: '#000',
                      padding: '18px 24px',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      marginBottom: '42px',
                    })}
                  >
                    <h3
                      className={css({
                        fontSize: '22px',
                        fontWeight: 'normal',
                        margin: '0',
                      })}
                    >
                      とりあえず受付窓口に行ってみる
                    </h3>
                    <dl>
                      {resultsGroupBy.map((resultGroup, i) => (
                        <React.Fragment key={`result-group-${i}`}>
                          <dt
                            className={css({
                              borderRadius: '4px',
                              border: '1px solid #afafaf',
                              backgroundColor: 'white',
                              marginTop: '1em',
                              padding: '0.5em',
                              maxWidth: '14em',
                            })}
                          >
                            {resultGroup[groupByKeys[0]]}
                          </dt>
                          {resultGroup.data.map((item1, j) => (
                            <dd
                              key={`result-group-item-${j}`}
                              className={css({
                                margin: '0 0 0 2em',
                                padding: '0',
                                position: 'relative',
                                _after: {
                                  content: '""',
                                  display: 'block',
                                  width: '1px',
                                  height:
                                    j === resultGroup.data.length - 1
                                      ? '2.5em'
                                      : '100%',
                                  position: 'absolute',
                                  top: '0',
                                  bottom: '0',
                                  left: '0',
                                  backgroundColor: '#000',
                                },
                                _before: {
                                  content: '""',
                                  borderTop: '1px solid',
                                  display: 'block',
                                  height: '100%',
                                  left: '0',
                                  marginTop: '1em',
                                  position: 'absolute',
                                  top: '1.5em',
                                  width: '1.5em',
                                },
                              })}
                            >
                              <dl
                                className={css({
                                  margin: '0',
                                  padding: '1em 0 0 1.5em',
                                  position: 'relative',
                                  _before: {
                                    content: '""',
                                    borderTop: '1px solid',
                                    display: 'block',
                                    height: '100%',
                                    left: '0',
                                    marginTop: '1em',
                                    position: 'absolute',
                                    top: '1.5em',
                                    width: '1.5em',
                                  },
                                })}
                              >
                                {item1[groupByKeys[1]] && (
                                  <dt
                                    className={css({
                                      borderRadius: '4px',
                                      border: '1px solid #afafaf',
                                      backgroundColor: 'white',
                                      margin: '0',
                                      padding: '0.5em',
                                      maxWidth: '14em',
                                    })}
                                  >{`${item1[groupByKeys[1]]}`}</dt>
                                )}
                                {item1.data.map(
                                  (
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    item2: any,
                                    k: number
                                  ) => (
                                    <dd
                                      key={`item-${j}-${k}`}
                                      className={css({
                                        margin: '0 0 0 2em',
                                        padding: '1em 0 0 1.5em',
                                        position: 'relative',
                                        _after: {
                                          content: '""',
                                          display: 'block',
                                          width: '1px',
                                          height:
                                            k === item1.data.length - 1
                                              ? '2.5em'
                                              : '100%',
                                          position: 'absolute',
                                          top: '0',
                                          bottom: '0',
                                          left: '0',
                                          backgroundColor: '#000',
                                        },
                                        _before: {
                                          content: '""',
                                          borderTop: '1px solid',
                                          display: 'block',
                                          height: '100%',
                                          left: '0',
                                          marginTop: '1em',
                                          position: 'absolute',
                                          top: '1.5em',
                                          width: '1.5em',
                                        },
                                      })}
                                    >
                                      <div
                                        className={css({
                                          borderRadius: '4px',
                                          border: '1px solid #afafaf',
                                          backgroundColor: 'white',
                                          margin: '0',
                                          padding: '0.5em',
                                          maxWidth: '20em',
                                        })}
                                      >{`${item2[groupByKeys[2]]}${
                                        item2.data[0]['場所'] !== ''
                                          ? `（${item2.data[0]['場所'].replace(
                                              ';',
                                              '・'
                                            )}）`
                                          : ''
                                      }`}</div>
                                    </dd>
                                  )
                                )}
                              </dl>
                            </dd>
                          ))}
                        </React.Fragment>
                      ))}
                    </dl>
                  </div>
                )}
                {results.length > 0 && (
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
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                          {`${i + 1}. ${result['手続名称']}`}
                        </h3>
                        <p
                          className={flex({
                            fontSize: '16px',
                            marginTop: '0',
                          })}
                          aria-label={`手続き名称：${result['書類正式名称']}`}
                        >
                          {isFontReady && (
                            <span
                              className={css({
                                fontSize: '18px',
                                fontFamily: 'Material Icons Round',
                                color: 'nerimaDark',
                                paddingRight: '8px',
                              })}
                              aria-hidden="true"
                            >
                              edit
                            </span>
                          )}
                          {`${result['書類正式名称']}`}
                        </p>
                        <p
                          className={flex({
                            fontSize: '22px',
                            marginTop: '0',
                          })}
                          aria-label={`受付窓口：${getConcatResults(
                            result,
                            concatDisplayKeys
                          )}`}
                        >
                          {isFontReady && (
                            <span
                              className={css({
                                fontSize: '24px',
                                fontFamily: 'Material Icons Round',
                                color: 'nerimaDark',
                                paddingRight: '12px',
                              })}
                              aria-hidden="true"
                            >
                              co_present
                            </span>
                          )}
                          {getConcatResults(result, concatDisplayKeys)}
                        </p>
                        <dl
                          className={grid({
                            columns: 2,
                            gridTemplateColumns: 'max-content auto',
                            gap: '4px',
                            fontSize: '14px',
                            margin: '0',
                          })}
                        >
                          {Object.entries(result)
                            .filter(
                              ([k]) =>
                                !excludeDisplayKeys.includes(k) &&
                                !concatDisplayKeys.includes(k)
                            )
                            .map(([key, value], j) => (
                              <React.Fragment key={`result-${j}`}>
                                <dt
                                  className={css({
                                    _after: { content: '" : "' },
                                  })}
                                >
                                  {key}
                                </dt>
                                <dd
                                  className={css({
                                    margin: '0',
                                    whiteSpace: 'pre-wrap',
                                  })}
                                >
                                  {/^http.?:\/\//.test(value as string) ? (
                                    <a
                                      href={value as string}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={css({
                                        wordBreak: 'break-all',
                                      })}
                                    >
                                      {value as string}
                                    </a>
                                  ) : (
                                    `${value}`
                                  )}
                                </dd>
                              </React.Fragment>
                            ))}
                        </dl>
                      </li>
                    ))}
                  </ol>
                )}
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
              </div>
            )}
          </div>
        </div>
        <footer
          className={css({ padding: '0 18px', '& a': { color: 'white' } })}
        >
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
