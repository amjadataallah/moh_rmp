import React from 'react'
import { logout } from '../../api/auth'

const Logout = () => {
  // Execute logout immediately when component mounts
  React.useEffect(() => {
    logout()
  }, [])

  // Show loading message while logout is in progress
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Logging out...</div>
      </div>
    </div>
  )
}

export default Logout