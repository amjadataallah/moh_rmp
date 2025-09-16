import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CButton,
  CBadge,
} from '@coreui/react'

const RoleTest = () => {
  const [currentRole, setCurrentRole] = useState('USER')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setCurrentRole(parsed.role || 'USER')
    }
  }, [])

  const setTestRole = (role) => {
    // Create test user data
    const testUser = {
      username: 'testuser',
      role: role,
      token: 'test-token'
    }
    
    localStorage.setItem('user', JSON.stringify(testUser))
    localStorage.setItem('token', 'test-token')
    setUser(testUser)
    setCurrentRole(role)
    
    // Trigger storage event to update navigation
    window.dispatchEvent(new Event('storage'))
    
    // Reload the page to see navigation changes
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4>Role Testing</h4>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <strong>Current Role: </strong>
                <CBadge color="primary">{currentRole}</CBadge>
              </div>
              
              {user && (
                <div className="mb-3">
                  <strong>User Data: </strong>
                  <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
              )}
              
              <div className="mb-3">
                <strong>Test Different Roles:</strong>
              </div>
              
              <div className="d-flex gap-2 mb-3">
                <CButton 
                  color="danger" 
                  onClick={() => setTestRole('ADMIN')}
                  active={currentRole === 'ADMIN'}
                >
                  Set ADMIN Role
                </CButton>
                <CButton 
                  color="warning" 
                  onClick={() => setTestRole('MANAGER')}
                  active={currentRole === 'MANAGER'}
                >
                  Set MANAGER Role
                </CButton>
                <CButton 
                  color="info" 
                  onClick={() => setTestRole('USER')}
                  active={currentRole === 'USER'}
                >
                  Set USER Role
                </CButton>
              </div>
              
              <div className="mt-4">
                <h5>Expected Navigation Behavior:</h5>
                <ul>
                  <li><strong>ADMIN:</strong> Can see all menu items including Users and System Lookups</li>
                  <li><strong>MANAGER:</strong> Can see Dashboard, Employees, Devices, and Profile (no Users or System Lookups)</li>
                  <li><strong>USER:</strong> Can see Dashboard, Employees, Devices, and Profile (no Users or System Lookups)</li>
                </ul>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default RoleTest