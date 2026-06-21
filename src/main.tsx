import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept all relative API fetch requests in production to route them directly to the Railway backend API
const originalFetch = window.fetch.bind(window);
const patchedFetch = function (input: any, init: any) {
  let urlStr = '';
  if (typeof input === 'string') {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (input && typeof input === 'object' && 'url' in input) {
    urlStr = (input as Request).url;
  }

  // Check if it's a relative API route
  if (urlStr.startsWith('/api/') || urlStr.match(/^\/api(?:\/|$)/)) {
    const isSandboxEnv = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' || 
                         window.location.hostname.endsWith('.run.app') || 
                         window.location.hostname.includes('.googleusercontent.com');

    // Default to the provided VITE_API_URL or the fallback api.bangtangallery.online domain when deployed on Netlify (production)
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'https://api.bangtangallery.online';

    // In sandbox env, keep native relative fetches unless VITE_API_URL is explicitly set
    if (!isSandboxEnv || (import.meta as any).env?.VITE_API_URL) {
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const cleanPath = urlStr.startsWith('/') ? urlStr : '/' + urlStr;
      const finalUrl = cleanBase + cleanPath;
      
      console.log(`[API PROXY] Routing relative request ${urlStr} to backend ${finalUrl}`);
      
      // If original input is a Request object, clone it with the new URL
      if (input && typeof input === 'object' && 'url' in input) {
        const newRequest = new Request(finalUrl, input as Request);
        return originalFetch(newRequest, init).catch((err: any) => {
          console.error(`[API PROXY ERROR] Failed to fetch request to ${finalUrl}:`, err);
          throw err;
        });
      }
      return originalFetch(finalUrl, init).catch((err: any) => {
          console.error(`[API PROXY ERROR] Failed to fetch string/url to ${finalUrl}:`, err);
          throw err;
      });
    }
  }

  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: patchedFetch,
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.warn('[API PROXY] Failed putting direct descriptor on window.fetch, falling back to direct assignment:', e);
  try {
    (window as any).fetch = patchedFetch;
  } catch (err) {
    console.error('[API PROXY] Could not override window.fetch:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
