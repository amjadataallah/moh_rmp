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
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CAlert,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilBriefcase } from '@coreui/icons';

const JobTitles = () => {
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch job titles
  const fetchJobTitles = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/job-titles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch job titles');
      const data = await response.json();
      setJobTitles(data);
    } catch (error) {
      setError('Failed to load job titles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobTitles(); }, []);

  const handleAdd = () => {
    setFormData({ code: '', name: '', description: '', status: 'ACTIVE' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEdit = (jobTitle) => {
    setEditingJobTitle(jobTitle);
    setFormData({
      code: jobTitle.code || '',
      name: jobTitle.name || '',
      description: jobTitle.description || '',
      status: jobTitle.status || 'ACTIVE'
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) errors.code = 'Code is required';
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.status) errors.status = 'Status is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const now = new Date().toISOString();
      const username = localStorage.getItem('username') || 'admin';
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
      };
      const response = await fetch('/api/job-titles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job title');
      }
      setShowAddModal(false);
      fetchJobTitles();
    } catch (error) {
      setFormErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm() || !editingJobTitle) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const now = new Date().toISOString();
      const username = localStorage.getItem('username') || 'admin';
      const requestBody = {
        id: editingJobTitle.id,
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        createdAt: editingJobTitle.createdAt,
        updatedAt: now,
        createdBy: editingJobTitle.createdBy || username,
        updatedBy: username
      };
      const response = await fetch(`/api/job-titles/${editingJobTitle.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job title');
      }
      setShowEditModal(false);
      setEditingJobTitle(null);
      fetchJobTitles();
    } catch (error) {
      setFormErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobTitles = jobTitles.filter(jt =>
    jt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jt.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Job Titles Management</h4>
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Job Title
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center p-3">
                <CSpinner color="primary" />
                <div className="mt-2">Loading job titles...</div>
              </div>
            ) : (
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
                  {filteredJobTitles.map((jt) => (
                    <CTableRow key={jt.id}>
                      <CTableDataCell>{jt.code}</CTableDataCell>
                      <CTableDataCell>{jt.name}</CTableDataCell>
                      <CTableDataCell>{jt.description}</CTableDataCell>
                      <CTableDataCell>{jt.status}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(jt)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {filteredJobTitles.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center text-muted">
                        No job titles found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add Job Title Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Add Job Title</CModalTitle>
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
                placeholder="Enter job title code"
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
                placeholder="Enter job title name"
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
            Add Job Title
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Job Title Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Edit Job Title</CModalTitle>
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
                placeholder="Enter job title code"
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
                placeholder="Enter job title name"
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
            Update Job Title
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default JobTitles;

