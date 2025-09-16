import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'
import { API_BASE_URL } from '../../api/config'

const Profile = () => {
  // Profile data state
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false)
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)

  // Profile update form state
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Alert states
  const [profileAlert, setProfileAlert] = useState({ show: false, message: '', color: 'success' })
  const [passwordAlert, setPasswordAlert] = useState({ show: false, message: '', color: 'success' })

  // Load profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEmail(data.email || '')
        setPhoneNumber(data.phoneNumber || '')
      } else {
        setProfileAlert({
          show: true,
          message: 'Failed to load profile data',
          color: 'danger'
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfileAlert({
        show: true,
        message: 'Error loading profile data',
        color: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setProfileUpdateLoading(true)
    setProfileAlert({ show: false, message: '', color: 'success' })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phoneNumber
        }),
      })

      if (response.ok) {
        setProfileAlert({
          show: true,
          message: 'Profile updated successfully!',
          color: 'success'
        })
        // Refresh profile data
        await fetchProfile()
      } else {
        const errorData = await response.json().catch(() => ({}))
        setProfileAlert({
          show: true,
          message: errorData.message || 'Failed to update profile',
          color: 'danger'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileAlert({
        show: true,
        message: 'Error updating profile',
        color: 'danger'
      })
    } finally {
      setProfileUpdateLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordChangeLoading(true)
    setPasswordAlert({ show: false, message: '', color: 'success' })

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordAlert({
        show: true,
        message: 'New password and confirm password do not match',
        color: 'danger'
      })
      setPasswordChangeLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
      })

      if (response.ok) {
        setPasswordAlert({
          show: true,
          message: 'Password changed successfully!',
          color: 'success'
        })
        // Clear password fields
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const errorData = await response.json().catch(() => ({}))
        setPasswordAlert({
          show: true,
          message: errorData.message || 'Failed to change password',
          color: 'danger'
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordAlert({
        show: true,
        message: 'Error changing password',
        color: 'danger'
      })
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  if (loading) {
    return (
      <CContainer fluid>
        <CRow className="justify-content-center">
          <CCol xs={12} className="text-center">
            <CSpinner color="primary" />
            <div className="mt-2">Loading profile...</div>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  return (
    <CContainer fluid>
      <CRow>
        <CCol xs={12}>
          <h1>Profile</h1>
        </CCol>
      </CRow>
      
      <CRow>
        {/* Profile Information Section */}
        <CCol xs={12} lg={6} className="mb-4">
          <CCard>
            <CCardHeader>
              <h4>Profile Information</h4>
            </CCardHeader>
            <CCardBody>
              {profileAlert.show && (
                <CAlert 
                  color={profileAlert.color} 
                  dismissible 
                  onClose={() => setProfileAlert({ show: false, message: '', color: 'success' })}
                >
                  {profileAlert.message}
                </CAlert>
              )}
              
              {profile && (
                <CForm onSubmit={handleProfileUpdate}>
                  <CRow className="mb-3">
                    <CCol sm={6}>
                      <CFormLabel htmlFor="username">Username</CFormLabel>
                      <CFormInput
                        type="text"
                        id="username"
                        value={profile.username}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                    <CCol sm={6}>
                      <CFormLabel htmlFor="role">Role</CFormLabel>
                      <CFormInput
                        type="text"
                        id="role"
                        value={profile.role}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                  </CRow>
                  
                  <CRow className="mb-3">
                    <CCol sm={6}>
                      <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                      <CFormInput
                        type="text"
                        id="firstName"
                        value={profile.firstName || ''}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                    <CCol sm={6}>
                      <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                      <CFormInput
                        type="text"
                        id="lastName"
                        value={profile.lastName || ''}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                  </CRow>
                  
                  <CRow className="mb-3">
                    <CCol sm={6}>
                      <CFormLabel htmlFor="email">Email *</CFormLabel>
                      <CFormInput
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CCol>
                    <CCol sm={6}>
                      <CFormLabel htmlFor="phoneNumber">Phone Number *</CFormLabel>
                      <CFormInput
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </CCol>
                  </CRow>
                  
                  <CRow className="mb-3">
                    <CCol sm={6}>
                      <CFormLabel htmlFor="healthCenterName">Health Center</CFormLabel>
                      <CFormInput
                        type="text"
                        id="healthCenterName"
                        value={profile.healthCenterName || ''}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                    <CCol sm={6}>
                      <CFormLabel htmlFor="departmentName">Department</CFormLabel>
                      <CFormInput
                        type="text"
                        id="departmentName"
                        value={profile.departmentName || ''}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                  </CRow>
                  
                  <CRow className="mb-3">
                    <CCol sm={6}>
                      <CFormLabel htmlFor="status">Status</CFormLabel>
                      <CFormInput
                        type="text"
                        id="status"
                        value={profile.status}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                    <CCol sm={6}>
                      <CFormLabel htmlFor="lastLogin">Last Login</CFormLabel>
                      <CFormInput
                        type="text"
                        id="lastLogin"
                        value={profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}
                        disabled
                        className="bg-light"
                      />
                    </CCol>
                  </CRow>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <CButton 
                      color="primary" 
                      type="submit"
                      disabled={profileUpdateLoading}
                    >
                      {profileUpdateLoading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </CButton>
                  </div>
                </CForm>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        
        {/* Change Password Section */}
        <CCol xs={12} lg={6} className="mb-4">
          <CCard>
            <CCardHeader>
              <h4>Change Password</h4>
            </CCardHeader>
            <CCardBody>
              {passwordAlert.show && (
                <CAlert 
                  color={passwordAlert.color} 
                  dismissible 
                  onClose={() => setPasswordAlert({ show: false, message: '', color: 'success' })}
                >
                  {passwordAlert.message}
                </CAlert>
              )}
              
              <CForm onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <CFormLabel htmlFor="currentPassword">Current Password</CFormLabel>
                  <CFormInput
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                
                <div className="mb-3">
                  <CFormLabel htmlFor="newPassword">New Password</CFormLabel>
                  <CFormInput
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                
                <div className="mb-3">
                  <CFormLabel htmlFor="confirmPassword">Confirm New Password</CFormLabel>
                  <CFormInput
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                
                <div className="d-grid">
                  <CButton 
                    color="warning" 
                    type="submit"
                    disabled={passwordChangeLoading}
                  >
                    {passwordChangeLoading ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Profile