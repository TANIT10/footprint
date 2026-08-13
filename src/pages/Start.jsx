import { useEffect } from 'react'
import logo from '../assets/footprint.png'

function Start({ onFinish }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <img
        src={logo}
        alt="발자국"
        style={{
          width: '70px',
          height: 'auto',
        }}
      />
    </div>
  )
}

export default Start