import React from 'react'
import { css } from '../../../styled-system/css'
import { GroupByKeyObject } from '../utils'

export default function ReceptionDeskTree(props: {
  resultsGroupBy: GroupByKeyObject[]
  groupByKeys: string[]
}) {
  const { resultsGroupBy, groupByKeys } = props

  return (
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
                      j === resultGroup.data.length - 1 ? '2.5em' : '100%',
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
                {item1[groupByKeys[1]] ? (
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
                                k === item1.data.length - 1 ? '2.5em' : '100%',
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
                ) : (
                  item1.data.map(
                    (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      item2: any,
                      k: number
                    ) => (
                      <div
                        key={`item-${j}-${k}`}
                        className={css({
                          margin: '0',
                          padding: '1em 0 0 1.5em',
                          position: 'relative',
                          _after: {
                            content: '""',
                            display: 'block',
                            width: '1px',
                            height:
                              k === item1.data.length - 1 ? '2.5em' : '100%',
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
                            ? `（${item2.data[0]['場所'].replace(';', '・')}）`
                            : ''
                        }`}</div>
                      </div>
                    )
                  )
                )}
              </dd>
            ))}
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}
