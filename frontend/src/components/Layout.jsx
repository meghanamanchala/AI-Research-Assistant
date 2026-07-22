import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Upload' },
  { to: '/agent', label: 'Research Agent' },
  { to: '/chat', label: 'Chat' },
  { to: '/summary', label: 'Summary' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/compare', label: 'Compare' },
];

export default function Layout({ children }) {
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          AI Research Assistant
        </Link>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
