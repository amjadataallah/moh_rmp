
import React, { useState, useEffect } from 'react';
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
  CFormSwitch
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil } from '@coreui/icons';

const userObj = JSON.parse(localStorage.getItem('user') || '{}');
const userRole = (userObj.role || '').trim().toUpperCase();

function Positions() {
  if (userRole !== 'ADMIN') {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <h4 className="mb-0">Positions Management</h4>
            </CCardHeader>
            <CCardBody>
              <CAlert color="danger">
                Access denied. Only ADMIN users can view this page.<br />
              </CAlert>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    );
  }
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch positions
  const fetchPositions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/positions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch positions');
      const data = await response.json();
      setPositions(Array.isArray(data) ? data.sort((a, b) => a.displayOrder - b.displayOrder) : []);
    } catch (error) {
      setError('Failed to load positions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPositions(); }, []);

  const handleAdd = () => {
    setFormData({ name: '', description: '', displayOrder: '', isActive: true });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name || '',
      description: position.description || '',
      displayOrder: position.displayOrder || '',
      isActive: !!position.isActive
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.displayOrder || isNaN(formData.displayOrder)) errors.displayOrder = 'Display Order must be a number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        id: 0,
        name: formData.name.trim(),
        description: formData.description.trim(),
        displayOrder: Number(formData.displayOrder),
        isActive: !!formData.isActive
      };
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create position');
      }
      setShowAddModal(false);
      fetchPositions();
    } catch (error) {
      setFormErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm() || !editingPosition) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        id: editingPosition.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        displayOrder: Number(formData.displayOrder),
        isActive: !!formData.isActive
      };
      const response = await fetch(`/api/positions/${editingPosition.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update position');
      }
      setShowEditModal(false);
      setEditingPosition(null);
      fetchPositions();
    } catch (error) {
      setFormErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Positions Management</h4>
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Position
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center p-3">
                <CSpinner color="primary" />
                <div className="mt-2">Loading positions...</div>
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Display Order</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Active</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {positions.map((position) => (
                    <CTableRow key={position.id}>
                      <CTableDataCell>{position.displayOrder}</CTableDataCell>
                      <CTableDataCell>{position.name}</CTableDataCell>
                      <CTableDataCell>{position.description}</CTableDataCell>
                      <CTableDataCell>
                        {position.isActive ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(position)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {positions.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center text-muted">
                        No positions found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add Position Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Add Position</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <CFormInput
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                invalid={!!formErrors.name}
                placeholder="Enter position name"
              />
              {formErrors.name ? (
                <div className="invalid-feedback d-block">{formErrors.name}</div>
              ) : null}
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
              <label className="form-label">Display Order *</label>
              <CFormInput
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                invalid={!!formErrors.displayOrder}
                placeholder="Enter display order"
              />
              {formErrors.displayOrder ? (
                <div className="invalid-feedback d-block">{formErrors.displayOrder}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Active</label>
              <CFormSwitch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                label={formData.isActive ? 'Active' : 'Inactive'}
              />
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
            Add Position
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Position Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Edit Position</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <CFormInput
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                invalid={!!formErrors.name}
                placeholder="Enter position name"
              />
              {formErrors.name ? (
                <div className="invalid-feedback d-block">{formErrors.name}</div>
              ) : null}
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
              <label className="form-label">Display Order *</label>
              <CFormInput
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                invalid={!!formErrors.displayOrder}
                placeholder="Enter display order"
              />
              {formErrors.displayOrder ? (
                <div className="invalid-feedback d-block">{formErrors.displayOrder}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Active</label>
              <CFormSwitch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                label={formData.isActive ? 'Active' : 'Inactive'}
              />
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
            Update Position
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
}

export default Positions;