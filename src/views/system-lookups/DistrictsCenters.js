import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
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
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
  CSpinner,
  CCollapse,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilBuilding, cilPlus, cilPencil, cilTrash, cilSearch, cilChevronRight, cilChevronBottom } from '@coreui/icons'
import { API_BASE_URL } from '../../api/config'
import { isAdmin } from '../../utils/roleUtils'

const DistrictsCenters = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('districts')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'add-center', 'edit-center'
  const [searchTerm, setSearchTerm] = useState('')
  const [districts, setDistricts] = useState([])
  const [healthCenters, setHealthCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [centersLoading, setCentersLoading] = useState(false)
  const [error, setError] = useState('')
  const [centersError, setCentersError] = useState('')
  const [expandedDistricts, setExpandedDistricts] = useState(new Set())
  
  // Add center modal state
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Edit center modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState(null)
  
  // Add center form state
  const [centerTypes, setCenterTypes] = useState([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'HOSPITAL',
    description: '',
    districtId: '',
    parentCenterId: '',
    status: 'ACTIVE'
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check user role and redirect if not ADMIN
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/access-denied', { replace: true })
    }
  }, [navigate])

  // Fetch districts from API
  useEffect(() => {
    fetchDistricts()
  }, [])

  // Fetch health centers when centers tab is activated
  useEffect(() => {
    if (activeTab === 'centers') {
      fetchHealthCenters()
    }
  }, [activeTab])

  // Fetch center types when modal opens
  useEffect(() => {
    if (showAddModal || showEditModal) {
      fetchCenterTypes()
    }
  }, [showAddModal, showEditModal])

  const fetchDistricts = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/districts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch districts')
      }

      const data = await response.json()
      console.log('Districts API Response:', data)
      setDistricts(data)
    } catch (error) {
      console.error('Error fetching districts:', error)
      setError('Failed to load districts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchHealthCenters = async () => {
    setCentersLoading(true)
    setCentersError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/health-centers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch health centers')
      }

      const data = await response.json()
      console.log('===== HEALTH CENTERS API RESPONSE =====')
      console.log('Health Centers API Response:', data)
      console.log('Sample center structure:', data[0])
      setHealthCenters(data)
    } catch (error) {
      console.error('Error fetching health centers:', error)
      setCentersError('Failed to load health centers. Please try again.')
    } finally {
      setCentersLoading(false)
    }
  }

  const fetchCenterTypes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/lookups/enums/center-type`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch center types')
      }

      const data = await response.json()
      setCenterTypes(data)
    } catch (error) {
      console.error('Error fetching center types:', error)
    }
  }

  // Helper functions for centers management
  const toggleDistrictExpansion = (districtId) => {
    const newExpanded = new Set(expandedDistricts)
    if (newExpanded.has(districtId)) {
      newExpanded.delete(districtId)
    } else {
      newExpanded.add(districtId)
    }
    setExpandedDistricts(newExpanded)
  }

  // Memoized grouping function to prevent re-processing on every render
  const groupedCentersByDistrict = useMemo(() => {
    const grouped = {}
    console.log('Grouping health centers:', healthCenters)
    
    // First pass: Group all centers by district (create deep copies to avoid mutation)
    healthCenters.forEach(center => {
      // Handle different possible district field structures
      let districtName = 'Unknown District'
      
      if (center.district) {
        // If district is a string
        if (typeof center.district === 'string') {
          districtName = center.district
        }
        // If district is an object with name property
        else if (center.district.name) {
          districtName = center.district.name
        }
      }
      // Alternative field names
      else if (center.districtName) {
        districtName = center.districtName
      }
      else if (center.location?.district) {
        districtName = center.location.district
      }
      
      console.log(`Center ${center.name || center.id} -> District: ${districtName}`)
      
      if (!grouped[districtName]) {
        grouped[districtName] = []
      }
      // Create a deep copy of the center to avoid mutating original data
      grouped[districtName].push({...center, children: undefined})
    })
    
    // Second pass: Organize parent-child relationships within each district
    Object.keys(grouped).forEach(districtName => {
      const centersInDistrict = grouped[districtName]
      const organized = []
      const childCenters = new Set()
      
      // Create a map for quick parent lookup - handle both string and number IDs
      const centerMap = new Map()
      centersInDistrict.forEach(center => {
        // Store with both string and number versions of the ID
        centerMap.set(center.id, center)
        centerMap.set(String(center.id), center)
        if (typeof center.id === 'string') {
          const numId = parseInt(center.id, 10)
          if (!isNaN(numId)) {
            centerMap.set(numId, center)
          }
        }
      })
      
      console.log(`Center map for ${districtName}:`, Array.from(centerMap.entries()).map(([id, center]) => `${id} -> ${center.name}`))
      
      // Process centers to identify parent-child relationships
      centersInDistrict.forEach(center => {
        // Check if this center has a parent - try multiple possible field names
        const parentId = center.parentId || 
                        center.parent_id || 
                        center.parentCenterId ||
                        center.parent_center_id ||
                        center.parent?.id ||
                        center.parentCenter?.id ||
                        center.healthCenterParentId ||
                        center.health_center_parent_id
        
        console.log(`Processing center ${center.name} (ID: ${center.id})`)
        console.log(`  Checking parent fields:`, {
          parentId: center.parentId,
          parent_id: center.parent_id,
          parentCenterId: center.parentCenterId,
          parent_center_id: center.parent_center_id,
          'parent.id': center.parent?.id,
          'parentCenter.id': center.parentCenter?.id,
          healthCenterParentId: center.healthCenterParentId,
          health_center_parent_id: center.health_center_parent_id
        })
        console.log(`  Final parent ID: ${parentId}`)
        
        if (parentId && centerMap.has(parentId)) {
          // This is a child center
          childCenters.add(center.id)
          const parent = centerMap.get(parentId)
          
          console.log(`✅ Found child center ${center.name} with parent ${parent.name}`)
          
          // Initialize children array if it doesn't exist
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(center)
        } else if (parentId) {
          console.log(`❌ Parent ID ${parentId} not found in district ${districtName} for center ${center.name}`)
          console.log(`   Available center IDs in district:`, Array.from(centerMap.keys()))
        } else {
          console.log(`ℹ️  No parent found for ${center.name} - treating as top-level center`)
        }
      })
      
      // Add only parent centers (or centers without parents) to the organized list
      centersInDistrict.forEach(center => {
        if (!childCenters.has(center.id)) {
          organized.push(center)
          console.log(`Added to organized list: ${center.name} (children: ${center.children ? center.children.length : 0})`)
        } else {
          console.log(`Excluded from organized list (is child): ${center.name}`)
        }
      })
      
      grouped[districtName] = organized
      console.log(`Final organized centers for ${districtName}:`, organized)
    })
    
    console.log('Grouped centers with hierarchy:', grouped)
    return grouped
  }, [healthCenters]) // Only re-run when healthCenters changes

  const getCenterTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'HOSPITAL':
        return <CIcon icon={cilBuilding} size="sm" className="me-2" />
      case 'CLINIC':
        return <CIcon icon={cilLocationPin} size="sm" className="me-2" />
      default:
        return <CIcon icon={cilLocationPin} size="sm" className="me-2" />
    }
  }

  // Helper function to count all centers including children
  const getTotalCenterCount = (centers) => {
    let count = 0
    centers.forEach(center => {
      count += 1 // Count the parent
      if (center.children && center.children.length > 0) {
        count += center.children.length // Count the children
      }
    })
    return count
  }
  const renderCenterRow = (center, level = 0) => {
    const rows = []
    const indentStyle = level > 0 ? { paddingLeft: `${level * 20}px` } : {}
    
    console.log(`Rendering center: ${center.name} at level ${level}, has ${center.children ? center.children.length : 0} children`)
    
    // Render parent center
    rows.push(
      <CTableRow key={center.id}>
        <CTableDataCell>
          <div className="d-flex align-items-center" style={indentStyle}>
            {level > 0 && <span className="text-muted me-2">└─</span>}
            {getCenterTypeIcon(center.type)}
            <span className="text-muted small">
              {center.type || 'CENTER'}
            </span>
          </div>
        </CTableDataCell>
        <CTableDataCell>
          <strong>{center.code}</strong>
        </CTableDataCell>
        <CTableDataCell>{center.name}</CTableDataCell>
        <CTableDataCell>
          <div className="d-flex gap-2">
            <CButton
              color="info"
              variant="outline"
              size="sm"
              onClick={() => handleEdit('edit-center', center.id)}
            >
              <CIcon icon={cilPencil} />
            </CButton>
          </div>
        </CTableDataCell>
      </CTableRow>
    )
    
    // Render children if they exist
    if (center.children && center.children.length > 0) {
      console.log(`Rendering ${center.children.length} children for ${center.name}`)
      center.children.forEach(child => {
        rows.push(...renderCenterRow(child, level + 1))
      })
    }
    
    return rows
  }

  const handleAdd = (type) => {
    setModalType(type)
    // Reset form when opening add modal
    if (type === 'add-center') {
      setFormData({
        code: '',
        name: '',
        type: 'HOSPITAL',
        description: '',
        districtId: '',
        parentCenterId: '',
        status: 'ACTIVE'
      })
      setFormErrors({})
    }
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    // Reset form data when closing modal
    setFormData({
      code: '',
      name: '',
      type: 'HOSPITAL',
      description: '',
      districtId: '',
      parentCenterId: '',
      status: 'ACTIVE'
    })
    setFormErrors({})
    setIsSubmitting(false)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Code is required'
    }
    
    if (!formData.type) {
      errors.type = 'Type is required'
    }
    
    if (!formData.districtId) {
      errors.districtId = 'District is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const selectedDistrict = districts.find(d => d.id === parseInt(formData.districtId))
      const selectedParent = formData.parentCenterId ? 
        healthCenters.find(c => c.id === parseInt(formData.parentCenterId)) : null

      const requestBody = {
        id: 0,
        name: formData.name.trim(),
        code: formData.code.trim(),
        type: formData.type,
        description: formData.description.trim(),
        districtId: parseInt(formData.districtId),
        districtName: selectedDistrict?.name || '',
        parentCenterId: formData.parentCenterId ? parseInt(formData.parentCenterId) : null,
        parentCenterName: selectedParent?.name || null,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: localStorage.getItem('username') || 'admin',
        updatedBy: localStorage.getItem('username') || 'admin'
      }

      const response = await fetch(`${API_BASE_URL}/api/health-centers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create center')
      }

      // Success - refresh the centers list and close modal
      await fetchHealthCenters()
      setShowModal(false)
      setFormData({
        name: '',
        code: '',
        type: 'HOSPITAL',
        description: '',
        districtId: '',
        parentCenterId: null,
        status: 'ACTIVE'
      })
      
    } catch (error) {
      console.error('Error creating center:', error)
      setFormErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault()
    
    if (!editingCenter) {
      setFormErrors({ general: 'No center selected for editing' })
      return
    }

    setFormErrors({})
    
    // Validate form
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setFormErrors({ general: 'Authentication token not found. Please login again.' })
        setIsSubmitting(false)
        return
      }

      const requestBody = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description?.trim() || null,
        districtId: parseInt(formData.districtId),
        parentCenterId: formData.parentCenterId ? parseInt(formData.parentCenterId) : null,
        status: formData.status || 'ACTIVE'
      }

  // Removed debug log

      const response = await fetch(`/api/health-centers/${editingCenter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

  // Removed debug log
      
      // Close modal and reset form
      setShowEditModal(false)
      setEditingCenter(null)
      setFormData({
        code: '',
        name: '',
        type: 'HOSPITAL',
        description: '',
        districtId: '',
        parentCenterId: '',
        status: 'ACTIVE'
      })
      setFormErrors({})
      
      // Refresh health centers
      fetchHealthCenters()

    } catch (error) {
  // Removed debug log
      setFormErrors({ 
        general: error.message || 'Failed to update center. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (type, id) => {
    const centerToEdit = healthCenters.find(center => center.id === id)
    if (centerToEdit) {
      setEditingCenter(centerToEdit)
      
      // Populate form with existing data
      setFormData({
        code: centerToEdit.code || '',
        name: centerToEdit.name || '',
        type: centerToEdit.type || 'HOSPITAL',
        description: centerToEdit.description || '',
        districtId: centerToEdit.districtId ? centerToEdit.districtId.toString() : '',
        parentCenterId: centerToEdit.parentCenterId ? centerToEdit.parentCenterId.toString() : '',
        status: centerToEdit.status || 'ACTIVE'
      })
      setFormErrors({})
      setShowEditModal(true)
    }
  }

  const filteredDistricts = districts.filter(district =>
    district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    district.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">
                  <CIcon icon={cilLocationPin} className="me-2" />
                  Districts & Centers Management
                </h4>
              </div>
              <div className="d-flex gap-2">
                <CInputGroup style={{ width: '300px' }}>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" className="mb-3">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'districts'}
                  onClick={() => setActiveTab('districts')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilLocationPin} className="me-2" />
                  Districts
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'centers'}
                  onClick={() => setActiveTab('centers')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilBuilding} className="me-2" />
                  Centers
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              <CTabPane visible={activeTab === 'districts'}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Districts</h5>
                </div>
                {loading && (
                  <div className="text-center my-3">
                    <CSpinner color="primary" />
                    <div>Loading districts...</div>
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                    <CButton 
                      color="primary" 
                      variant="outline" 
                      size="sm" 
                      className="ms-2"
                      onClick={fetchDistricts}
                    >
                      Retry
                    </CButton>
                  </div>
                )}
                {!loading && !error && (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Code</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {filteredDistricts.map((district) => (
                        <CTableRow key={district.id}>
                          <CTableDataCell>{district.code}</CTableDataCell>
                          <CTableDataCell>{district.name}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={district.status === 'ACTIVE' ? 'success' : 'secondary'}>
                              {district.status}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      {filteredDistricts.length === 0 && !loading && (
                        <CTableRow>
                          <CTableDataCell colSpan="3" className="text-center text-muted">
                            No districts found
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'centers'}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Health Centers</h5>
                  <CButton
                    color="primary"
                    onClick={() => handleAdd('add-center')}
                  >
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Center
                  </CButton>
                </div>

                {centersLoading && (
                  <div className="text-center p-3">
                    <CSpinner color="primary" />
                    <div className="mt-2">Loading health centers...</div>
                  </div>
                )}

                {centersError && (
                  <CAlert color="danger" dismissible>
                    {centersError}
                  </CAlert>
                )}

                {!centersLoading && !centersError && (
                  <div>
                    {Object.keys(groupedCentersByDistrict).length === 0 ? (
                      <div className="text-center text-muted p-4">
                        <CIcon icon={cilLocationPin} size="3xl" className="mb-3" />
                        <div>No health centers found</div>
                      </div>
                    ) : (
                      Object.entries(groupedCentersByDistrict).map(([districtName, centers]) => (
                        <CCard key={districtName} className="mb-3">
                          <CCardHeader
                            className="d-flex justify-content-between align-items-center cursor-pointer"
                            onClick={() => toggleDistrictExpansion(districtName)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center">
                              <CIcon 
                                icon={expandedDistricts.has(districtName) ? cilChevronBottom : cilChevronRight} 
                                className="me-2" 
                              />
                              <strong>{districtName}</strong>
                              <CBadge color="secondary" className="ms-2">
                                {getTotalCenterCount(centers)} center{getTotalCenterCount(centers) !== 1 ? 's' : ''}
                              </CBadge>
                            </div>
                          </CCardHeader>
                          <CCollapse visible={expandedDistricts.has(districtName)}>
                            <CCardBody>
                              <CTable hover responsive>
                                <CTableHead>
                                  <CTableRow>
                                    <CTableHeaderCell>Type</CTableHeaderCell>
                                    <CTableHeaderCell>Code</CTableHeaderCell>
                                    <CTableHeaderCell>Name</CTableHeaderCell>
                                    <CTableHeaderCell>Actions</CTableHeaderCell>
                                  </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                  {centers.map((center) => renderCenterRow(center)).flat()}
                                </CTableBody>
                              </CTable>
                            </CCardBody>
                          </CCollapse>
                        </CCard>
                      ))
                    )}
                  </div>
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add Center Modal */}
      <CModal visible={showAddModal} onClose={handleCloseModal} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Health Center</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formErrors.general && (
            <CAlert color="danger" className="mb-3">
              {formErrors.general}
            </CAlert>
          )}
          <CForm>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Center Code *</label>
                <CFormInput
                  type="text"
                  placeholder="Enter center code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  invalid={!!formErrors.code}
                />
                {formErrors.code && <div className="invalid-feedback d-block">{formErrors.code}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Center Name *</label>
                <CFormInput
                  type="text"
                  placeholder="Enter center name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  invalid={!!formErrors.name}
                />
                {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">District *</label>
                <CFormSelect
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  invalid={!!formErrors.districtId}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </CFormSelect>
                {formErrors.districtId && <div className="invalid-feedback d-block">{formErrors.districtId}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Center Type *</label>
                <CFormSelect
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  invalid={!!formErrors.type}
                >
                  <option value="">Select Center Type</option>
                  {centerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </CFormSelect>
                {formErrors.type && <div className="invalid-feedback d-block">{formErrors.type}</div>}
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Parent Center</label>
                <CFormSelect
                  value={formData.parentCenterId}
                  onChange={(e) => setFormData({ ...formData, parentCenterId: e.target.value })}
                  invalid={!!formErrors.parentCenterId}
                >
                  <option value="">No Parent (Level 0)</option>
                  {/* Show centers without parents (level 0) as potential parents */}
                  {healthCenters
                    .filter(center => {
                      // Check all possible parent field names to ensure we get true level 0 centers
                      const parentId = center.parentId || 
                                      center.parent_id || 
                                      center.parentCenterId ||
                                      center.parent_center_id ||
                                      center.parent?.id ||
                                      center.parentCenter?.id ||
                                      center.healthCenterParentId ||
                                      center.health_center_parent_id
                      
                      return !parentId && center.districtId === parseInt(formData.districtId)
                    })
                    .map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                </CFormSelect>
                {formErrors.parentCenterId && <div className="invalid-feedback d-block">{formErrors.parentCenterId}</div>}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <CFormTextarea
                rows={3}
                placeholder="Enter center description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                invalid={!!formErrors.description}
              />
              {formErrors.description && <div className="invalid-feedback d-block">{formErrors.description}</div>}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              'Add Center'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Center Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Edit Health Center</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formErrors.general && (
            <CAlert color="danger" className="mb-3">
              {formErrors.general}
            </CAlert>
          )}
          <CForm>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Center Code *</label>
                <CFormInput
                  type="text"
                  placeholder="Enter center code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  invalid={!!formErrors.code}
                />
                {formErrors.code && <div className="invalid-feedback d-block">{formErrors.code}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Center Name *</label>
                <CFormInput
                  type="text"
                  placeholder="Enter center name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  invalid={!!formErrors.name}
                />
                {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">District *</label>
                <CFormSelect
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  invalid={!!formErrors.districtId}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </CFormSelect>
                {formErrors.districtId && <div className="invalid-feedback d-block">{formErrors.districtId}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Center Type *</label>
                <CFormSelect
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  invalid={!!formErrors.type}
                >
                  <option value="">Select Center Type</option>
                  {centerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </CFormSelect>
                {formErrors.type && <div className="invalid-feedback d-block">{formErrors.type}</div>}
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Parent Center</label>
                <CFormSelect
                  value={formData.parentCenterId}
                  onChange={(e) => setFormData({ ...formData, parentCenterId: e.target.value })}
                  invalid={!!formErrors.parentCenterId}
                >
                  <option value="">No Parent (Level 0)</option>
                  {/* Show centers without parents (level 0) as potential parents */}
                  {healthCenters
                    .filter(center => {
                      // Check all possible parent field names to ensure we get true level 0 centers
                      const parentId = center.parentId || 
                                      center.parent_id || 
                                      center.parentCenterId ||
                                      center.parent_center_id ||
                                      center.parent?.id ||
                                      center.parentCenter?.id ||
                                      center.healthCenterParentId ||
                                      center.health_center_parent_id
                      
                      // Exclude the current center being edited and ensure it's in the same district
                      return !parentId && 
                             center.id !== editingCenter?.id && 
                             center.districtId === parseInt(formData.districtId)
                    })
                    .map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                </CFormSelect>
                {formErrors.parentCenterId && <div className="invalid-feedback d-block">{formErrors.parentCenterId}</div>}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <CFormTextarea
                rows={3}
                placeholder="Enter center description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                invalid={!!formErrors.description}
              />
              {formErrors.description && <div className="invalid-feedback d-block">{formErrors.description}</div>}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowEditModal(false)}
            disabled={isSubmitting}
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleEditSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Center'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default DistrictsCenters