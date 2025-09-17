import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CAlert,
  CSpinner,
  CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil } from '@coreui/icons'

const userObj = JSON.parse(localStorage.getItem('user') || '{}')
const userRole = (userObj.role || '').trim().toUpperCase()

function Users() {
  if (userRole !== 'ADMIN') {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <h4 className="mb-0">User Management</h4>
            </CCardHeader>
            <CCardBody>
              <CAlert color="danger">
                Access denied. Only ADMIN users can view this page.<br />
              </CAlert>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'USER',
    healthCenterId: '',
    departmentId: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [healthCenters, setHealthCenters] = useState([])
  const [departments, setDepartments] = useState([])
  const [filter, setFilter] = useState('')

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch health centers (only top-level)
  const fetchHealthCenters = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/health-centers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) return
      const data = await response.json()
      setHealthCenters(data.filter((c) => !c.parentCenterId || c.parentCenterId === 0))
    } catch {
      setHealthCenters([])
    }
  }

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/departments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) return
      const data = await response.json()
      setDepartments(Array.isArray(data) ? data : [])
    } catch {
      setDepartments([])
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchHealthCenters()
    fetchDepartments()
  }, [])

  const handleAdd = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'USER',
      healthCenterId: '',
      departmentId: ''
    })
    setFormErrors({})
    setShowAddModal(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'USER',
      healthCenterId: user.healthCenterId || '',
      departmentId: user.departmentId || ''
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handlePasswordReset = (user) => {
    setEditingUser(user)
    setPasswordValue('')
    setPasswordError('')
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = async () => {
    if (!passwordValue.trim()) {
      setPasswordError('New password is required')
      return
    }
    setIsPasswordSubmitting(true)
    setPasswordError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${editingUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: passwordValue })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to reset password')
      }
      setShowPasswordModal(false)
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.username.trim()) errors.username = 'Username is required'
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.password.trim() && !editingUser) errors.password = 'Password is required'
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required'
    if (!formData.role) errors.role = 'Role is required'
  const isAdmin = formData.role === 'ADMIN'
    if (!isAdmin) {
      if (!formData.healthCenterId) errors.healthCenterId = 'Health Center is required'
      if (!formData.departmentId) errors.departmentId = 'Department is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSubmit = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
  const isAdmin = formData.role === 'ADMIN'
      const requestBody = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        ...(isAdmin ? {} : {
          healthCenterId: Number(formData.healthCenterId),
          departmentId: Number(formData.departmentId),
  }),
      }
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create user')
      }
      setShowAddModal(false)
      fetchUsers()
    } catch (error) {
      setFormErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!validateForm() || !editingUser) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const isAdmin = formData.role === 'ADMIN'
      const requestBody = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        status: editingUser.status
      }
      if (!isAdmin) {
        if (formData.healthCenterId) requestBody.healthCenterId = Number(formData.healthCenterId)
        if (formData.departmentId) requestBody.departmentId = Number(formData.departmentId)
      }
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update user')
      }
      setShowEditModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      setFormErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter users by username, email, firstName, lastName
  const filteredUsers = users.filter((u) => {
    const f = filter.trim().toLowerCase()
    if (!f) return true
    return (
      u.username.toLowerCase().includes(f) ||
      u.email.toLowerCase().includes(f) ||
      u.firstName.toLowerCase().includes(f) ||
      u.lastName.toLowerCase().includes(f)
    )
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">User Management</h4>
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Add User
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            <div className="mb-3">
              <CFormInput
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by username, email, first or last name"
              />
            </div>
            {loading ? (
              <div className="text-center p-3">
                <CSpinner color="primary" />
                <div className="mt-2">Loading users...</div>
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Username</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>First Name</CTableHeaderCell>
                    <CTableHeaderCell>Last Name</CTableHeaderCell>
                    <CTableHeaderCell>Phone</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Health Center</CTableHeaderCell>
                    <CTableHeaderCell>Department</CTableHeaderCell>
                    <CTableHeaderCell>Last Login</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUsers.map((user) => (
                    <CTableRow key={user.id}>
                      <CTableDataCell>{user.username}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>{user.firstName}</CTableDataCell>
                      <CTableDataCell>{user.lastName}</CTableDataCell>
                      <CTableDataCell>{user.phoneNumber}</CTableDataCell>
                      <CTableDataCell>{user.role}</CTableDataCell>
                      <CTableDataCell>{user.status}</CTableDataCell>
                      <CTableDataCell>{user.healthCenterName}</CTableDataCell>
                      <CTableDataCell>{user.departmentName}</CTableDataCell>
                      <CTableDataCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : ''}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="me-2"
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="warning"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePasswordReset(user)}
                        >
                          Reset Password
                        </CButton>
      {/* Reset Password Modal */}
      <CModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Reset Password for {editingUser?.username}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">New Password *</label>
              <CFormInput
                type="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                invalid={!!passwordError}
                placeholder="Enter new password"
              />
              {passwordError ? (
                <div className="invalid-feedback d-block">{passwordError}</div>
              ) : null}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPasswordModal(false)} disabled={isPasswordSubmitting}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handlePasswordSubmit} disabled={isPasswordSubmitting}>
            {isPasswordSubmitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Update Password
          </CButton>
        </CModalFooter>
      </CModal>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={11} className="text-center text-muted">
                        No users found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add User Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Add User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Username *</label>
              <CFormInput
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                invalid={!!formErrors.username}
                placeholder="Enter username"
              />
              {formErrors.username ? (
                <div className="invalid-feedback d-block">{formErrors.username}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <CFormInput
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                invalid={!!formErrors.email}
                placeholder="Enter email"
              />
              {formErrors.email ? (
                <div className="invalid-feedback d-block">{formErrors.email}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Password *</label>
              <CFormInput
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                invalid={!!formErrors.password}
                placeholder="Enter password"
              />
              {formErrors.password ? (
                <div className="invalid-feedback d-block">{formErrors.password}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">First Name *</label>
              <CFormInput
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                invalid={!!formErrors.firstName}
                placeholder="Enter first name"
              />
              {formErrors.firstName ? (
                <div className="invalid-feedback d-block">{formErrors.firstName}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name *</label>
              <CFormInput
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                invalid={!!formErrors.lastName}
                placeholder="Enter last name"
              />
              {formErrors.lastName ? (
                <div className="invalid-feedback d-block">{formErrors.lastName}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number *</label>
              <CFormInput
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                invalid={!!formErrors.phoneNumber}
                placeholder="Enter phone number"
              />
              {formErrors.phoneNumber ? (
                <div className="invalid-feedback d-block">{formErrors.phoneNumber}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Role *</label>
              <CFormSelect
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                invalid={!!formErrors.role}
              >
                <option value="">Select role</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="USER">USER</option>
              </CFormSelect>
              {formErrors.role ? (
                <div className="invalid-feedback d-block">{formErrors.role}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Health Center *</label>
              <CFormSelect
                value={formData.healthCenterId}
                onChange={(e) => setFormData({ ...formData, healthCenterId: e.target.value })}
                invalid={!!formErrors.healthCenterId}
              >
                <option value="">Select health center</option>
                {healthCenters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </CFormSelect>
              {formErrors.healthCenterId ? (
                <div className="invalid-feedback d-block">{formErrors.healthCenterId}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Department *</label>
              <CFormSelect
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                invalid={!!formErrors.departmentId}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </CFormSelect>
              {formErrors.departmentId ? (
                <div className="invalid-feedback d-block">{formErrors.departmentId}</div>
              ) : null}
            </div>
            {formErrors.submit && <div className="alert alert-danger">{formErrors.submit}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAddSubmit} disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Add User
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit User Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Edit User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Username *</label>
              <CFormInput
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                invalid={!!formErrors.username}
                placeholder="Enter username"
              />
              {formErrors.username ? (
                <div className="invalid-feedback d-block">{formErrors.username}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <CFormInput
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                invalid={!!formErrors.email}
                placeholder="Enter email"
              />
              {formErrors.email ? (
                <div className="invalid-feedback d-block">{formErrors.email}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <CFormInput
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password (leave blank to keep current)"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">First Name *</label>
              <CFormInput
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                invalid={!!formErrors.firstName}
                placeholder="Enter first name"
              />
              {formErrors.firstName ? (
                <div className="invalid-feedback d-block">{formErrors.firstName}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name *</label>
              <CFormInput
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                invalid={!!formErrors.lastName}
                placeholder="Enter last name"
              />
              {formErrors.lastName ? (
                <div className="invalid-feedback d-block">{formErrors.lastName}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number *</label>
              <CFormInput
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                invalid={!!formErrors.phoneNumber}
                placeholder="Enter phone number"
              />
              {formErrors.phoneNumber ? (
                <div className="invalid-feedback d-block">{formErrors.phoneNumber}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Role *</label>
              <CFormSelect
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                invalid={!!formErrors.role}
              >
                <option value="">Select role</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="USER">USER</option>
              </CFormSelect>
              {formErrors.role ? (
                <div className="invalid-feedback d-block">{formErrors.role}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Health Center *</label>
              <CFormSelect
                value={formData.healthCenterId}
                onChange={(e) => setFormData({ ...formData, healthCenterId: e.target.value })}
                invalid={!!formErrors.healthCenterId}
              >
                <option value="">Select health center</option>
                {healthCenters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </CFormSelect>
              {formErrors.healthCenterId ? (
                <div className="invalid-feedback d-block">{formErrors.healthCenterId}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Department *</label>
              <CFormSelect
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                invalid={!!formErrors.departmentId}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </CFormSelect>
              {formErrors.departmentId ? (
                <div className="invalid-feedback d-block">{formErrors.departmentId}</div>
              ) : null}
            </div>
            {formErrors.submit && <div className="alert alert-danger">{formErrors.submit}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleEditSubmit} disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Update User
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Users
