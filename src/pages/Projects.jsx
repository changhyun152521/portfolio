import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PortfolioCard from '../components/PortfolioCard'
import { portfolioData } from '../data/portfolioData'
import './Projects.css'

function Projects() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'completed'
  const [filter, setFilter] = useState(initialFilter) // completed, in-progress

  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam && (filterParam === 'completed' || filterParam === 'in-progress')) {
      setFilter(filterParam)
    }
  }, [searchParams])

  const handleCardClick = (id) => {
    navigate(`/project/${id}`)
  }

  const filteredProjects = portfolioData.filter((project) => {
    return project.status === filter
  })

  return (
    <div className="projects-page">
      <section className="portfolio-section">
        <div className="section-container">
          <h2 className="section-title">My Projects</h2>
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => {
                setFilter('completed')
                navigate('/projects?filter=completed', { replace: true })
              }}
            >
              완성된 프로젝트
            </button>
            <button
              className={`filter-button ${filter === 'in-progress' ? 'active' : ''}`}
              onClick={() => {
                setFilter('in-progress')
                navigate('/projects?filter=in-progress', { replace: true })
              }}
            >
              프로젝트 연습과정
            </button>
          </div>
          <div className="portfolio-grid">
            {filteredProjects.map((project, index) => (
              <PortfolioCard
                key={project.id}
                project={project}
                index={index}
                onClick={() => handleCardClick(project.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Projects

