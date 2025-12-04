import { useState, useEffect } from 'react'
import './PortfolioCard.css'

function PortfolioCard({ project, index, onClick }) {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 150)

    return () => clearTimeout(timer)
  }, [index])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
    })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <div
      className={`portfolio-card ${isVisible ? 'visible' : ''}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg) translateZ(0)`
      }}
    >
      <div className="card-inner">
        <div className="card-image-container">
          <div className="card-image-wrapper">
            <div className="device-frame pc-frame">
              <div className="device-screen">
                <img
                  src={project.pcImage || '/placeholder-pc.jpg'}
                  alt={`${project.title} PC`}
                  className="device-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect fill="%231e293b" width="800" height="600"/><text x="50%25" y="50%25" fill="%2360a5fa" font-size="24" text-anchor="middle" dominant-baseline="middle">PC Image</text></svg>'
                  }}
                />
              </div>
            </div>
            <div className="device-frame mobile-frame">
              <div className="device-screen">
                <img
                  src={project.mobileImage || '/placeholder-mobile.jpg'}
                  alt={`${project.title} Mobile`}
                  className="device-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="375" height="667" viewBox="0 0 375 667"><rect fill="%231e293b" width="375" height="667"/><text x="50%25" y="50%25" fill="%2360a5fa" font-size="18" text-anchor="middle" dominant-baseline="middle">Mobile Image</text></svg>'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-content">
          <h3 className="card-title">{project.title}</h3>
          <p className="card-description">{project.description}</p>
          <div className="card-tags">
            {project.tags?.map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="card-overlay">
          <span className="view-detail">상세보기 →</span>
        </div>
      </div>
    </div>
  )
}

export default PortfolioCard

