import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  const handleGoToProjects = () => {
    navigate('/projects')
  }

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="hero-line">개인적으로 만든</span>
              <span className="hero-line">웹사이트와 앱을 모아둔</span>
            </h1>
            <p className="hero-subtitle">MY PROJECTS</p>
            <p className="hero-description">Changhyun's Portfolio</p>
            <button className="hero-button" onClick={handleGoToProjects}>
              포트폴리오 보러가기
            </button>
          </div>
        </div>
        <div className="hero-background"></div>
      </div>
    </div>
  )
}

export default Home

