import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CButton,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilHome, cilArrowLeft } from '@coreui/icons'

const AccessDenied = () => {
  const navigate = useNavigate()

  // Get user information for display
  const getUserInfo = () => {
    try {
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        return {
          username: userData.username || 'User',
          role: userData.role || 'USER'
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
    return { username: 'User', role: 'USER' }
  }

  const { username, role } = getUserInfo()

  const handleGoHome = () => {
    navigate('/dashboard', { replace: true })
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg={8} md={10}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <CIcon 
                      icon={cilLockLocked} 
                      size="4xl" 
                      className="text-danger"
                    />
                  </div>
                  <h1 className="display-4 text-danger">403</h1>
                  <h2 className="h4 mb-3">Access Denied</h2>
                  <p className="text-muted fs-5 mb-4">
                    You don't have permission to access this page.
                  </p>
                </div>

                <CAlert color="warning" className="d-flex align-items-center mb-4">
                  <CIcon icon={cilLockLocked} className="flex-shrink-0 me-2" />
                  <div>
                    <strong>Insufficient Privileges</strong>
                    <div className="mt-1">
                      <small>
                        Logged in as: <strong>{username}</strong> (Role: <strong>{role}</strong>)
                      </small>
                    </div>
                    <div className="mt-1">
                      <small>
                        This page requires higher access privileges. Please contact your administrator if you believe you should have access to this resource.
                      </small>
                    </div>
                  </div>
                </CAlert>

                <div className="d-flex justify-content-center gap-3">
                  <CButton 
                    color="primary" 
                    onClick={handleGoHome}
                    className="px-4"
                  >
                    <CIcon icon={cilHome} className="me-2" />
                    Go to Dashboard
                  </CButton>
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    onClick={handleGoBack}
                    className="px-4"
                  >
                    <CIcon icon={cilArrowLeft} className="me-2" />
                    Go Back
                  </CButton>
                </div>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    If you need access to this page, please contact your system administrator.
                  </small>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default AccessDenied