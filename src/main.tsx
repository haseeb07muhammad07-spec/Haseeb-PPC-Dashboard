import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Silence unhandled rejections from third-party browser extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    (event.reason.stack && event.reason.stack.includes('chrome-extension://')) ||
    (typeof event.reason === 'string' && event.reason.includes('chrome-extension://')) ||
    (event.reason.message && event.reason.message.includes('fetch of #<Window>'))
  )) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
