import { css } from '../../styled-system/css'

export default function Loading() {
  return (
    <div>
      <div
        className={css({
          position: 'relative',
          backgroundColor: 'white',
          opacity: '0.25',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          transformOrigin: 'center center',
          display: 'inline-block',
          left: '-18px',
          top: '0',
          animation: 'ScaleAlphaBefore 1s infinite linear',
        })}
      ></div>
      <div
        className={css({
          position: 'relative',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          opacity: '1',
          animation: 'ScaleAlpha 1s infinite linear',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          transformOrigin: 'center center',
          display: 'inline-block',
        })}
      ></div>
      <div
        className={css({
          position: 'relative',
          backgroundColor: 'white',
          opacity: '0.25',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          transformOrigin: 'center center',
          display: 'inline-block',
          right: '-18px',
          top: '0',
          animation: 'ScaleAlphaAfter 1s infinite linear',
        })}
      ></div>
    </div>
  )
}
