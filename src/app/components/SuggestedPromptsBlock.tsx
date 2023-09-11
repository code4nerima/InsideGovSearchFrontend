import { useEffect, useState } from 'react'
import { css } from '../../../styled-system/css'

export default function SuggestedPromptsBlock(props: {
  suggestedPrompts: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangePrompt: any
  doClear: boolean
}) {
  const { suggestedPrompts, onChangePrompt, doClear } = props
  const [selectedValue, setSelectedValue] = useState('')

  const handleChangePrompt = (e: { target: { value: string } }) => {
    setSelectedValue(e.target.value)
  }

  useEffect(() => {
    if (selectedValue !== '') {
      onChangePrompt(selectedValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue])

  useEffect(() => {
    if (doClear) {
      setSelectedValue('')
    }
  }, [doClear])

  return (
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
              checked={selectedValue === prompt}
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
  )
}
