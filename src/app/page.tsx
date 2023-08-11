import Image from 'next/image'
import Link from 'next/link'
import { css } from '../../styled-system/css'
import { center, flex, grid } from '../../styled-system/patterns'

export default function Home() {
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
          height: '100vh',
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
          height: '100vh',
        })}
      >
        <div
          className={flex({
            flexDirection: 'column',
            align: 'center',
            justify: 'center',
            margin: '40px',
            padding: '0 20px',
            border: '1px solid white',
            borderRadius: '7vw',
          })}
        >
          <p
            className={center({
              fontSize: '2rem',
              textShadow: 'default',
              animation: 'FloatHorizontal 7.0s ease-in-out infinite alternate',
            })}
          >
            <span
              className={css({
                animation: 'FloatVertical 6.0s ease-in-out infinite alternate',
              })}
            >
              あなたが知りたいことはなんですか？
            </span>
          </p>
          <div
            className={css({
              position: 'relative',
              width: '95%',
              maxWidth: '550px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            <textarea
              rows={3}
              className={css({
                borderRadius: '8px',
                fontSize: '18px',
                width: '100%',
                padding: '12px 76px 12px 48px',
                border: 'none',
                backgroundColor: 'nerimaLight',
                _placeholder: {
                  fontFamily: '"M PLUS 2 Variable", sans-serif',
                  fontWeight: 'thin',
                  color: 'nerimaDark',
                },
              })}
              placeholder="知りたいことを文章で書いてみてください"
            ></textarea>
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
                fontSize: '20px',
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
                  left: '-6px',
                  margin: 'auto',
                },
              })}
            >
              検索
            </button>
          </div>
        </div>
        <footer className={css({ padding: '0 20px 20px' })}>
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
