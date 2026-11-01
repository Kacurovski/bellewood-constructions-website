import { HashRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { useLenis } from './hooks/useLenis'
import { RouteReturnProvider } from './hooks/useRouteReturn'
import Home from './pages/Home'
import Work from './pages/Work'
import Approach from './pages/Approach'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

/**
 * HashRouter, deliberately.
 *
 * This build is handed over as static output with `base: './'` and is finished
 * inside GHL AI Studio. Two things follow from that: the built `dist/` has to
 * open and work from any path, including straight off the filesystem, and there
 * is no server to rewrite unknown paths back to index.html.
 *
 * A history router would need that rewrite, and its relative asset URLs would
 * resolve against the wrong depth on any nested route. Hash routing needs
 * neither. If the site later lands somewhere with SPA rewrites configured and
 * clean URLs are wanted, this is the single line to change.
 */
export default function App() {
  return (
    <HashRouter>
      <RouteReturnProvider>
        <Shell />
      </RouteReturnProvider>
    </HashRouter>
  )
}

function Shell() {
  useLenis()

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/approach" element={<Approach />} />
          <Route path="/work/:slug" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
