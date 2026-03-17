/**
 * Guest ID Debug Utility
 * Provides diagnostic tools for troubleshooting Guest ID functionality
 */

import { getGuestId, saveGuestId } from './guestIdManager';

/**
 * Log current Guest ID status to console
 */
export const logGuestIdStatus = () => {
  console.group('[Guest ID Debug]');
  
  const localStorageId = getGuestId();
  console.log('localStorage guestId:', localStorageId || 'NOT FOUND');
  
  // Check cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  const guestIdCookie = cookies.find(c => c.startsWith('guestId='));
  console.log('Cookie guestId:', guestIdCookie ? guestIdCookie.substring(8) : 'NOT FOUND');
  
  console.log('All cookies:', document.cookie || 'NONE');
  
  console.groupEnd();
};

/**
 * Test Guest ID API endpoint
 */
export const testGuestIdEndpoint = async (apiUrl = '') => {
  console.group('[Guest ID API Test]');
  
  try {
    const url = `${apiUrl}/api/health`;
    console.log('Testing endpoint:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:');
    console.log('  X-Guest-ID:', response.headers.get('X-Guest-ID'));
    console.log('  Content-Type:', response.headers.get('Content-Type'));
    console.log('  Set-Cookie:', response.headers.get('Set-Cookie'));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    // Check if guestId was saved
    const savedId = getGuestId();
    console.log('Guest ID after request:', savedId || 'NOT SAVED');
    
    console.groupEnd();
    return { success: true, data };
  } catch (err) {
    console.error('[Guest ID API Test] Failed:', err.message);
    console.groupEnd();
    return { success: false, error: err.message };
  }
};

/**
 * Clear Guest ID and test fresh creation
 */
export const testFreshGuestId = async (apiUrl = '') => {
  console.group('[Guest ID Fresh Test]');
  
  try {
    // Clear existing
    console.log('Clearing existing Guest ID...');
    localStorage.removeItem('guestId');
    
    // Force fresh cookie by making request
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'GET',
      credentials: 'include',
    });
    
    const guestId = response.headers.get('X-Guest-ID');
    console.log('New Guest ID from server:', guestId);
    
    // Check if it was saved
    const savedId = getGuestId();
    console.log('Guest ID saved to localStorage:', savedId);
    
    console.log('Test result:', guestId === savedId ? '✓ SUCCESS' : '✗ MISMATCH');
    
    console.groupEnd();
  } catch (err) {
    console.error('[Guest ID Fresh Test] Failed:', err.message);
    console.groupEnd();
  }
};

/**
 * Mount debug info as window global for console access
 */
export const initDebugTools = (apiUrl = '') => {
  window.__guestIdDebug = {
    status: () => logGuestIdStatus(),
    test: () => testGuestIdEndpoint(apiUrl),
    fresh: () => testFreshGuestId(apiUrl),
    getGuestId,
    saveGuestId,
  };
};
