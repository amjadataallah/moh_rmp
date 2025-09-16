// ...existing code...
// ...existing code...
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
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil } from '@coreui/icons'

const userObj = JSON.parse(localStorage.getItem('user') || '{}');
const userRole = (userObj.role || '').trim().toUpperCase();

function Companies() {
  const handleEditSubmit = async () => {
    if (!validateForm() || !editingCompany) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const now = new Date().toISOString();
      const requestBody = {
        id: editingCompany.id,
        companyName: formData.companyName.trim(),
        companyAddress: formData.companyAddress.trim(),
        contactPerson: formData.contactPerson.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        createdAt: editingCompany.createdAt,
        updatedAt: now
      };
      const response = await fetch(`/api/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update company');
      }
      setShowEditModal(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      setFormErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (userRole !== 'ADMIN') {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <h4 className="mb-0">Companies Management</h4>
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
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('companyName');
  const [sortDir, setSortDir] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    contactPerson: '',
    phoneNumber: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = `/api/companies?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [page, size, sortBy, sortDir]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleAdd = () => {
    setFormData({ companyName: '', companyAddress: '', contactPerson: '', phoneNumber: '', email: '' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName || '',
      companyAddress: company.companyAddress || '',
      contactPerson: company.contactPerson || '',
      phoneNumber: company.phoneNumber || '',
      email: company.email || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) errors.companyName = 'Company Name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact Person is required';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone Number is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.companyAddress.trim()) errors.companyAddress = 'Address is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const now = new Date().toISOString();
      const requestBody = {
        id: 0,
        companyName: formData.companyName.trim(),
        companyAddress: formData.companyAddress.trim(),
        contactPerson: formData.contactPerson.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        createdAt: now,
        updatedAt: now
      };
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create company');
      }
      setShowAddModal(false);
      fetchCompanies();
    } catch (error) {
      setFormErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ...existing code for handleEditSubmit...

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Companies Management</h4>
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Company
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center p-3">
                <CSpinner color="primary" />
                <div className="mt-2">Loading companies...</div>
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Company Name</CTableHeaderCell>
                    <CTableHeaderCell>Contact Person</CTableHeaderCell>
                    <CTableHeaderCell>Phone Number</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Address</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {companies.map((company) => (
                    <CTableRow key={company.id}>
                      <CTableDataCell>{company.companyName}</CTableDataCell>
                      <CTableDataCell>{company.contactPerson}</CTableDataCell>
                      <CTableDataCell>{company.phoneNumber}</CTableDataCell>
                      <CTableDataCell>{company.email}</CTableDataCell>
                      <CTableDataCell>{company.companyAddress}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(company)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {companies.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center text-muted">
                        No companies found
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

      {/* Add Company Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Add Company</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Company Name *</label>
              <CFormInput
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                invalid={!!formErrors.companyName}
                placeholder="Enter company name"
              />
              {formErrors.companyName ? (
                <div className="invalid-feedback d-block">{formErrors.companyName}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Contact Person *</label>
              <CFormInput
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                invalid={!!formErrors.contactPerson}
                placeholder="Enter contact person"
              />
              {formErrors.contactPerson ? (
                <div className="invalid-feedback d-block">{formErrors.contactPerson}</div>
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
              <label className="form-label">Address *</label>
              <CFormInput
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                invalid={!!formErrors.companyAddress}
                placeholder="Enter address"
              />
              {formErrors.companyAddress ? (
                <div className="invalid-feedback d-block">{formErrors.companyAddress}</div>
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
            Add Company
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Company Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Edit Company</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Company Name *</label>
              <CFormInput
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                invalid={!!formErrors.companyName}
                placeholder="Enter company name"
              />
              {formErrors.companyName ? (
                <div className="invalid-feedback d-block">{formErrors.companyName}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Contact Person *</label>
              <CFormInput
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                invalid={!!formErrors.contactPerson}
                placeholder="Enter contact person"
              />
              {formErrors.contactPerson ? (
                <div className="invalid-feedback d-block">{formErrors.contactPerson}</div>
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
              <label className="form-label">Address *</label>
              <CFormInput
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                invalid={!!formErrors.companyAddress}
                placeholder="Enter address"
              />
              {formErrors.companyAddress ? (
                <div className="invalid-feedback d-block">{formErrors.companyAddress}</div>
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
            Update Company
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
}

export default Companies;