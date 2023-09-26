'use client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { css } from '../../styled-system/css'
import { center, flex, grid } from '../../styled-system/patterns'
import ReceptionDeskTree from './components/ReceptionDeskTree'
import SearchResultsBlock from './components/SearchResultsBlock'
import SendFeedbackBlock from './components/SendFeedbackBlock'
import SuggestedPromptsBlock from './components/SuggestedPromptsBlock'
import Loading from './loading'
import { GroupByKeyObject, getGroupByKeysRecursive } from './utils'

const AudioRecognition = dynamic(
  () => import('./components/AudioRecognition'),
  { ssr: false }
)

const groupByKeys = ['場所種別', '担当課', '担当係']
const excludeDisplayKeys = [
  'ID',
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

export default function Home() {
  const searchParams = useSearchParams()
  const debug = searchParams.get('debug')
  const resultTitleRef = useRef<HTMLHeadingElement>(null)

  const [currentPrompt, setCurrentPrompt] = useState('')
  const [results, setResults] = useState([])
  const [resultsGroupBy, setResultsGroupBy] = useState<Array<GroupByKeyObject>>(
    []
  )
  const [keyword, setKeyword] = useState('')
  const [synonym, setSynonym] = useState('')
  const [suggestedPrompts, setSuggestedPrompts] = useState([])
  const [selectedLimit, setSelectedLimit] = useState(0)
  const [isSearchExecuting, setIsSearchExecuting] = useState(false)
  const [isResultResponded, setIsResultResponded] = useState(false)
  const [isSuggestedPromptResponded, setIsSuggestedPromptResponded] =
    useState(false)
  const [isPromptSelected, setIsPromptSelected] = useState(false)
  const [isComposed, setIsComposed] = useState(false)
  const [isFontReady, setIsFontReady] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

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
      setIsPromptSelected(false)
      await suggestPrompt(prompt)
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error', error.message)
      } else {
        console.log('Error')
      }
    } finally {
      setIsResultResponded(true)
      setIsSearchExecuting(false)
      setIsPromptSelected(false)
    }
  }

  const suggestPrompt = async (prompt: string) => {
    try {
      const res = await fetch('/api/promptVariations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyDown = async (e: any) => {
    if (e.keyCode === 13 && !isComposed && !isRecording) {
      e.preventDefault()
      await handleSearch(currentPrompt)
    }
  }

  const handleReset = () => {
    setResults([])
    setResultsGroupBy([])
    setKeyword('')
    setSynonym('')
    setIsResultResponded(false)
    setIsSuggestedPromptResponded(false)
  }

  const handleClearAll = () => {
    setIsPromptSelected(false)
    setCurrentPrompt('')
    setSuggestedPrompts([])
    handleReset()
  }

  const handleChangePrompt = async (prompt: string) => {
    setIsPromptSelected(true)
    setCurrentPrompt(prompt)
    await handleSearch(prompt)
  }

  const getRecognitionResult = (text: string) => {
    setCurrentPrompt(text)
  }

  const getStatusRecording = (status: boolean) => {
    setIsRecording(status)
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

  useEffect(() => {
    const handleSearchAsync = async () => {
      if (currentPrompt !== '' && !isRecording) {
        await handleSearch(currentPrompt)
      }
    }
    handleSearchAsync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording])

  return (
    <>
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
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
          }}
        />
      </div>
      <div
        className={flex({
          direction: 'column',
          flex: '1 0 100%',
          backgroundColor: 'rgba(30, 58, 138, 0.25)',
          color: 'white',
        })}
      >
        <div
          className={grid({
            flex: '1 0 100%',
            columns: 1,
            gridTemplateRows: 'auto min-content',
            minHeight: '100%',
          })}
        >
          <div
            className={grid({
              columns: 1,
              gridTemplateRows: 'min-content auto',
              gap: '18px',
              margin: 'min(4vw, 60px) min(4vw, 60px) 0 min(4vw, 60px)',
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
              練馬区 窓口・手続きガイド
            </h1>
            <div
              className={grid({
                columns: 1,
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
                    fontSize: { mdTo2xl: '32px', smDown: '28px' },
                    textShadow: 'default',
                    letterSpacing: { mdTo2xl: '2px' },
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
                  margin: '-15px auto 0',
                  padding: '18px',
                  backgroundColor: 'rgba(0, 0, 0, 0.36)',
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
                    maxLength={100}
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
                    disabled={isSearchExecuting || isRecording}
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
                className={flex({
                  paddingTop:
                    isResultResponded || isSuggestedPromptResponded
                      ? '0'
                      : '50px',
                  justify: 'center',
                  transform:
                    isResultResponded || isSuggestedPromptResponded
                      ? 'translateY(0)'
                      : 'translateY(25%)',
                  transition: 'transform 0.5s cubic-bezier(.37,.24,.55,1)',
                })}
              >
                <AudioRecognition
                  getRecognitionResult={getRecognitionResult}
                  getStatusRecording={getStatusRecording}
                  isSearchExecuting={
                    isSearchExecuting ||
                    (!isSuggestedPromptResponded && isResultResponded)
                  }
                  doClear={
                    (isSearchExecuting && !isResultResponded) ||
                    isResultResponded ||
                    currentPrompt === ''
                  }
                />
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
              {isSuggestedPromptResponded || isPromptSelected ? (
                <div
                  className={css({
                    width: 'min(97%, 650px)',
                    margin: '0 auto',
                  })}
                >
                  <SuggestedPromptsBlock
                    suggestedPrompts={suggestedPrompts}
                    onChangePrompt={handleChangePrompt}
                    disabled={isSearchExecuting}
                    doClear={currentPrompt === ''}
                  />
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
                  className={css({
                    width: 'min(97%, 650px)',
                    margin: '0 auto',
                  })}
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
                    <ReceptionDeskTree
                      resultsGroupBy={resultsGroupBy}
                      groupByKeys={groupByKeys}
                    />
                  )}
                  {results.length > 0 && (
                    <SearchResultsBlock
                      results={results}
                      excludeDisplayKeys={excludeDisplayKeys}
                      concatDisplayKeys={concatDisplayKeys}
                    />
                  )}
                  <SendFeedbackBlock
                    prompt={currentPrompt}
                    keyword={keyword}
                    synonym={synonym}
                    doClear={currentPrompt === ''}
                  />
                </div>
              )}
            </div>
          </div>
          <div
            className={css({ padding: '0 18px', '& a': { color: 'white' } })}
          >
            <p
              className={css({ fontSize: { mdTo2xl: '16px', smDown: '14px' } })}
            >
              航空写真、練馬区、
              <Link href="https://creativecommons.org/licenses/by/4.0/deed.ja">
                クリエイティブ・コモンズ・ライセンス表示 4.0 国際
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
