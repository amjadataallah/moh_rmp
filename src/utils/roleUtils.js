/**
 * Utility functions for role-based access control
 */

/**
 * Get the current user's role from localStorage
 * @returns {string} The user's role (defaults to 'USER' if not found)
 */
export const getUserRole = () => {
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      return userData.role || 'USER'
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }
  return 'USER'
}

/**
 * Get the current user's information from localStorage
 * @returns {object} Object containing username and role
 */
export const getUserInfo = () => {
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      return {
        username: userData.username || 'User',
        role: userData.role || 'USER',
        id: userData.id || null,
        email: userData.email || null
      }
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }
  return { username: 'User', role: 'USER', id: null, email: null }
}

/**
 * Check if the current user has the required role
 * @param {string|string[]} requiredRoles - Single role or array of roles
 * @returns {boolean} True if user has required role(s)
 */
export const hasRole = (requiredRoles) => {
  const userRole = getUserRole()
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole)
  }
  
  return userRole === requiredRoles
}

/**
 * Check if the current user has ADMIN role
 * @returns {boolean} True if user is ADMIN
 */
export const isAdmin = () => {
  return hasRole('ADMIN')
}

/**
 * Check if the current user has MANAGER role or higher
 * @returns {boolean} True if user is MANAGER or ADMIN
 */
export const isManager = () => {
  return hasRole(['ADMIN', 'MANAGER'])
}

/**
 * React hook for role-based access control with automatic redirect
 * @param {string|string[]} requiredRoles - Required roles for access
 * @param {function} navigate - React Router navigate function
 * @param {string} redirectPath - Path to redirect to if access denied (default: '/access-denied')
 * @returns {boolean} True if user has access
 */
export const useRoleAccess = (requiredRoles, navigate, redirectPath = '/access-denied') => {
  const hasAccess = hasRole(requiredRoles)
  
  if (!hasAccess && navigate) {
    navigate(redirectPath, { replace: true })
  }
  
  return hasAccess
}

/**
 * Higher-order component for role-based access control
 * @param {React.Component} Component - Component to protect
 * @param {string|string[]} requiredRoles - Required roles for access
 * @returns {React.Component} Protected component
 */
export const withRoleAccess = (Component, requiredRoles) => {
  return (props) => {
    const hasAccess = hasRole(requiredRoles)
    
    if (!hasAccess) {
      // Navigate to access denied page
      window.location.href = '#/access-denied'
      return null
    }
    
    return <Component {...props} />
  }
}