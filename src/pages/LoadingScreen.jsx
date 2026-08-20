import './LoadingScreen.css'

import footprint from '../assets/footprint.png'

function LoadingScreen() {
  return (
    <div
      className="loading-screen"
      role="status"
      aria-live="polite"
      aria-label="게시글 목록을 불러오는 중"
    >
      <div className="loading-screen-content">
        <div
          className="loading-footprints"
          aria-hidden="true"
        >
          <img
            className="loading-footprint loading-footprint-one"
            src={footprint}
            alt=""
          />

          <img
            className="loading-footprint loading-footprint-two"
            src={footprint}
            alt=""
          />

          <img
            className="loading-footprint loading-footprint-three"
            src={footprint}
            alt=""
          />
        </div>

        <p className="loading-message">
          발자국을 따라가는 중이에요
          <span className="loading-dots">
            ...
          </span>
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen