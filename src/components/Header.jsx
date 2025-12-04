import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Changhyun's Portfolio
        </Link>
      </div>
    </header>
  )
}

export default Header

