import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/cormorant-garamond/wght.css';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/dm-sans/wght.css';
import '@fontsource-variable/caveat/wght.css';
import { App } from './app/App';
import './styles/base.css';

const Editor = import.meta.env.DEV && window.location.pathname === '/personalize'
  ? lazy(() => import('./app/PersonalizationEditor')) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Editor ? <Suspense fallback={<p className="scene-pending">Loading preview editor…</p>}><Editor /></Suspense> : <App />}
  </StrictMode>,
);
