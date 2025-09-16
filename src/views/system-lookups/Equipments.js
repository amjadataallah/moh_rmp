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
import { cilSettings, cilPlus, cilPencil, cilSearch } from '@coreui/icons'

const Equipments = () => {
  const [equipments, setEquipments] = useState([])
  const [equipmentTypes, setEquipmentTypes] = useState([])
  // Fetch equipment types from API
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/devices/equipment-types`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch equipment types')
        const data = await response.json()
  // API returns array of strings, e.g. ["LABORATORY","RADIOLOGY_IMAGING","ANESTHESIA"]
  setEquipmentTypes(Array.isArray(data) ? data : [])
      } catch (error) {
        setEquipmentTypes([])
      }
    }
    fetchTypes()
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState('equipmentType')
  const [sortDir, setSortDir] = useState('asc')
  const [filterType, setFilterType] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [formData, setFormData] = useState({ equipmentType: '', equipmentName: '' })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch equipments from API
  const fetchEquipments = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      let url = `/api/equipments?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch equipments')
      const data = await response.json()
      let allEquipments = data.content || []
      // Filter by equipmentType if filterType is set
      if (filterType) {
        allEquipments = allEquipments.filter(eq => eq.equipmentType === filterType)
      }
      setEquipments(allEquipments)
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      setError('Failed to load equipments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEquipments() }, [page, size, sortBy, sortDir, filterType])

  const handleFilterTypeChange = (e) => {
  const value = e.target.value
  setPage(0)
  setFilterType(value)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const handleAdd = () => {
    setFormData({ equipmentType: '', equipmentName: '' })
    setFormErrors({})
    setShowAddModal(true)
  }

  const handleEdit = (equipment) => {
    setEditingEquipment(equipment)
    setFormData({
      equipmentType: equipment.equipmentType || '',
      equipmentName: equipment.equipmentName || '',
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.equipmentType.trim()) errors.equipmentType = 'Type is required'
    if (!formData.equipmentName.trim()) errors.equipmentName = 'Name is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSubmit = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const now = new Date().toISOString()
      const requestBody = {
        id: 0,
        equipmentType: formData.equipmentType,
        equipmentName: formData.equipmentName,
        createdAt: now,
        updatedAt: now,
      }
      const response = await fetch(`/api/equipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create equipment')
      }
      setShowAddModal(false)
      fetchEquipments()
    } catch (error) {
      setFormErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!validateForm() || !editingEquipment) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const now = new Date().toISOString()
      const requestBody = {
        id: editingEquipment.id,
        equipmentType: formData.equipmentType,
        equipmentName: formData.equipmentName,
        createdAt: editingEquipment.createdAt,
        updatedAt: now,
      }
      const response = await fetch(`/api/equipments/${editingEquipment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update equipment')
      }
      setShowEditModal(false)
      setEditingEquipment(null)
      fetchEquipments()
    } catch (error) {
      setFormErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <CIcon icon={cilSettings} className="me-2" />
                Equipments Management
              </h4>
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Equipment
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3 d-flex align-items-center gap-2">
              <label className="form-label mb-0">Filter by Type:</label>
              <CFormSelect value={filterType} onChange={handleFilterTypeChange} style={{ width: 200 }}>
                <option value="">All Types</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </CFormSelect>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
              <div className="text-center p-3">
                <span className="spinner-border spinner-border-sm" />
                <div className="mt-2">Loading equipments...</div>
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell onClick={() => handleSort('equipmentType')} style={{ cursor: 'pointer' }}>
                      Type {sortBy === 'equipmentType' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell onClick={() => handleSort('equipmentName')} style={{ cursor: 'pointer' }}>
                      Name {sortBy === 'equipmentName' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {equipments.map((equipment) => (
                    <CTableRow key={equipment.id}>
                      <CTableDataCell>{equipment.equipmentType}</CTableDataCell>
                      <CTableDataCell>{equipment.equipmentName}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(equipment)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {equipments.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={3} className="text-center text-muted">
                        No equipments found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
            {/* Pagination controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>
                Page {page + 1} of {totalPages} | Total: {totalElements}
              </span>
              <div>
                <CButton
                  color="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="me-2"
                >
                  Previous
                </CButton>
                <CButton
                  color="secondary"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add Equipment Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Add Equipment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Type *</label>
              <CFormSelect
                value={formData.equipmentType}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                invalid={!!formErrors.equipmentType}
              >
                <option value="">Select Type</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </CFormSelect>
              {formErrors.equipmentType && <div className="invalid-feedback d-block">{formErrors.equipmentType}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <CFormInput
                type="text"
                value={formData.equipmentName}
                onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                invalid={!!formErrors.equipmentName}
                placeholder="Enter equipment name"
              />
              {formErrors.equipmentName && <div className="invalid-feedback d-block">{formErrors.equipmentName}</div>}
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
            Add Equipment
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Equipment Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Edit Equipment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Type *</label>
              <CFormSelect
                value={formData.equipmentType}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                invalid={!!formErrors.equipmentType}
              >
                <option value="">Select Type</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </CFormSelect>
              {formErrors.equipmentType && <div className="invalid-feedback d-block">{formErrors.equipmentType}</div>}
              
            </div>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <CFormInput
                type="text"
                value={formData.equipmentName}
                onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                invalid={!!formErrors.equipmentName}
                placeholder="Enter equipment name"
              />
              {formErrors.equipmentName && <div className="invalid-feedback d-block">{formErrors.equipmentName}</div>}
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
            Update Equipment
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Equipments