import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../api/config'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      // If already authenticated, redirect to dashboard
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (response.status === 200) {
        const data = await response.json()
        // Store token and user data in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data))
        // Redirect to dashboard
        navigate('/dashboard')
      } else if (response.status === 401) {
        setError('Invalid credentials')
      } else if (response.status === 403) {
        setError('Account is disabled or suspended')
      } else {
        setError('Login failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCardGroup>
              <CCard className="p-4" style={{ maxWidth: '350px', margin: '0 auto' }}>
                <CCardBody>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <img src="/logo.png" alt="Logo" style={{ maxWidth: '120px', height: 'auto' }} />
                  </div>
                  <CForm onSubmit={handleSubmit}>
                    <h1 className="text-center">Login</h1>
                    <p className="text-body-secondary text-center">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    {error && (
                      <div style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
                        {error}
                      </div>
                    )}
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Login
                        </CButton>
                      </CCol>
                      {/* Forgot password button removed */}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
export default Login
