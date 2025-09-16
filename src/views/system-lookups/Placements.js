
import React, { useEffect, useState } from 'react';
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
  CAlert,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilList } from '@coreui/icons';

const ENUM_APIS = [
  { key: 'status', label: 'Status', url: '/api/lookups/enums/status' },
  { key: 'positionStatus', label: 'Position Status', url: '/api/lookups/enums/position-status' },
  { key: 'maritalStatus', label: 'Marital Status', url: '/api/lookups/enums/marital-status' },
  { key: 'gender', label: 'Gender', url: '/api/lookups/enums/gender' },
  { key: 'employmentStatus', label: 'Employment Status', url: '/api/lookups/enums/employment-status' },
  { key: 'contractType', label: 'Contract Type', url: '/api/lookups/enums/contract-type' },
  { key: 'centerType', label: 'Center Type', url: '/api/lookups/enums/center-type' },
];

const ConstantData = () => {
  const [enumData, setEnumData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllEnums = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const results = await Promise.all(
          ENUM_APIS.map(async (api) => {
            const response = await fetch(api.url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok) throw new Error(`Failed to fetch ${api.label}`);
            const data = await response.json();
            return { key: api.key, label: api.label, data };
          })
        );
        const dataObj = {};
        results.forEach(({ key, label, data }) => {
          dataObj[key] = { label, data };
        });
        setEnumData(dataObj);
      } catch (err) {
        setError('Failed to load constant data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllEnums();
  }, []);

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4 className="mb-0">
              <CIcon icon={cilList} className="me-2" />
              Constant Data
            </h4>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center p-3">
                <CSpinner color="primary" />
                <div className="mt-2">Loading constant data...</div>
              </div>
            ) : (
              Object.keys(enumData).length === 0 ? (
                <div className="text-center text-muted">No constant data found.</div>
              ) : (
                Object.entries(enumData).map(([key, { label, data }]) => (
                  <div key={key} className="mb-4">
                    <h5 className="mb-2">{label}</h5>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          {data.length > 0 && Object.keys(data[0]).map((col) => (
                            <CTableHeaderCell key={col}>{col}</CTableHeaderCell>
                          ))}
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {data.length > 0 ? (
                          data.map((row, idx) => (
                            <CTableRow key={idx}>
                              {Object.values(row).map((val, i) => (
                                <CTableDataCell key={i}>{val}</CTableDataCell>
                              ))}
                            </CTableRow>
                          ))
                        ) : (
                          <CTableRow>
                            <CTableDataCell colSpan={Object.keys(data[0] || {}).length} className="text-center text-muted">
                              No data found
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </CTableBody>
                    </CTable>
                  </div>
                ))
              )
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}

export default ConstantData;