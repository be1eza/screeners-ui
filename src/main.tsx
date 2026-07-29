import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import AppTheme from '@/theme/AppTheme';
import App from '@/App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found in index.html');

createRoot(root).render(
  <StrictMode>
    {/* HashRouter: zero GitHub Pages config, no deep-link 404s (CLAUDE.md). */}
    <HashRouter>
      <AppTheme>
        <App />
      </AppTheme>
    </HashRouter>
  </StrictMode>,
);
