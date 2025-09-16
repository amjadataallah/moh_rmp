import React, { useState } from 'react'
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
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBriefcase, cilPlus, cilPencil, cilTrash, cilSearch } from '@coreui/icons'

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE'
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch departments
  const fetchDepartments = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/departments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch departments')
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      setError('Failed to load departments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchDepartments() }, [])

  const handleAdd = () => {
    setFormData({ code: '', name: '', description: '', status: 'ACTIVE' })
    setFormErrors({})
    setShowAddModal(true)
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      code: department.code || '',
      name: department.name || '',
      description: department.description || '',
      status: department.status || 'ACTIVE'
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.code.trim()) errors.code = 'Code is required'
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.status) errors.status = 'Status is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSubmit = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const now = new Date().toISOString()
      const username = localStorage.getItem('username') || 'admin'
      const requestBody = {
        id: 0,
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        createdAt: now,
        updatedAt: now,
        createdBy: username,
        updatedBy: username
      }
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create department')
      }
      setShowAddModal(false)
      fetchDepartments()
    } catch (error) {
      setFormErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!validateForm() || !editingDepartment) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const now = new Date().toISOString()
      const username = localStorage.getItem('username') || 'admin'
      const requestBody = {
        id: editingDepartment.id,
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        createdAt: editingDepartment.createdAt,
        updatedAt: now,
        createdBy: editingDepartment.createdBy || username,
        updatedBy: username
      }
      const response = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update department')
      }
      setShowEditModal(false)
      setEditingDepartment(null)
      fetchDepartments()
    } catch (error) {
      setFormErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <CIcon icon={cilBriefcase} className="me-2" />
                Departments Management
              </h4>
              <div className="d-flex gap-2">
                <CInputGroup style={{ width: '300px' }}>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
                <CButton color="primary" onClick={handleAdd}>
                  <CIcon icon={cilPlus} className="me-2" />
                  Add Department
                </CButton>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredDepartments.map((department) => (
                  <CTableRow key={department.id}>
                    <CTableDataCell>{department.code}</CTableDataCell>
                    <CTableDataCell>{department.name}</CTableDataCell>
                    <CTableDataCell>{department.description}</CTableDataCell>
                    <CTableDataCell>{department.status}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(department)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add Department Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Add Department</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Code *</label>
              <CFormInput
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                invalid={!!formErrors.code}
                placeholder="Enter department code"
              />
              {formErrors.code && <div className="invalid-feedback d-block">{formErrors.code}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <CFormInput
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                invalid={!!formErrors.name}
                placeholder="Enter department name"
              />
              {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <CFormInput
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Status *</label>
              <CFormSelect
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                invalid={!!formErrors.status}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </CFormSelect>
              {formErrors.status && <div className="invalid-feedback d-block">{formErrors.status}</div>}
            </div>
            {formErrors.submit && <div className="alert alert-danger">{formErrors.submit}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAddSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : null}
            Add Department
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Department Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Edit Department</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Code *</label>
              <CFormInput
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                invalid={!!formErrors.code}
                placeholder="Enter department code"
              />
              {formErrors.code && <div className="invalid-feedback d-block">{formErrors.code}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <CFormInput
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                invalid={!!formErrors.name}
                placeholder="Enter department name"
              />
              {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <CFormInput
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Status *</label>
              <CFormSelect
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                invalid={!!formErrors.status}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </CFormSelect>
              {formErrors.status && <div className="invalid-feedback d-block">{formErrors.status}</div>}
            </div>
            {formErrors.submit && <div className="alert alert-danger">{formErrors.submit}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleEditSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : null}
            Update Department
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Departments