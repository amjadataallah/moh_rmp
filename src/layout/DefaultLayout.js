import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      // If not authenticated, redirect to login
      navigate('/login', { replace: true })
      return
    }
  }, [navigate])

  // Check authentication before rendering
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (!token || !user) {
    return null // Don't render anything while redirecting
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
