import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import App from './App.jsx';
import { saveGuestId, getGuestId } from './utils/guestIdManager';

// Enable axios to send cookies with every request (httpOnly cookie)
axios.defaults.withCredentials = true

// Add request interceptor to send cached guestId as header
axios.interceptors.request.use(
  (config) => {
    const guestId = getGuestId()
    if (guestId) {
      config.headers['X-Guest-ID'] = guestId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to capture X-Guest-ID header
axios.interceptors.response.use(
  (response) => {
    // Try to get guestId from multiple sources
    const guestId = 
      response.headers['x-guest-id'] ||
      response.headers['X-Guest-ID'] ||
      response.data?._guestId

    if (guestId) {
      saveGuestId(guestId)
    }
    return response
  },
  (error) => {
    if (error.response?.headers) {
      const guestId = 
        error.response.headers['x-guest-id'] || 
        error.response.headers['X-Guest-ID'] || 
        error.response.data?._guestId
      if (guestId) {
        saveGuestId(guestId)
      }
    }
    return Promise.reject(error)
  }
)

// Defer non-critical initializations
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Any non-critical setup here
  }, { timeout: 2000 })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
