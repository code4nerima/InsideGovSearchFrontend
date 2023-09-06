import React, { useEffect, useState } from 'react'
import { css } from '../../../styled-system/css'
import { flex, grid } from '../../../styled-system/patterns'
import { getConcatResults } from '../utils'

export default function SearchResultsBlock(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[]
  excludeDisplayKeys: string[]
  concatDisplayKeys: string[]
}) {
  const { results, excludeDisplayKeys, concatDisplayKeys } = props
  const [isFontReady, setIsFontReady] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(function () {
      setIsFontReady(true)
    })
  }, [])

  return (
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
  )
}
