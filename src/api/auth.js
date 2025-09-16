import { API_BASE_URL } from './config'

export const logout = async () => {
  try {
    const token = localStorage.getItem('token')
    
    if (token) {
      // Call the logout API
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      // Note: We don't throw error if logout API fails, 
      // as we still want to clear local storage
    }
  } catch (error) {
    console.error('Error during logout API call:', error)
    // Continue with local cleanup even if API call fails
  } finally {
    // Always clear local storage and redirect
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Trigger storage event to update navigation
    window.dispatchEvent(new Event('storage'))
    
    // Redirect to login page (using hash routing)
    window.location.href = '#/login'
  }
}