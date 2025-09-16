import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react'

const Employees = () => {
  return (
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4>Employees</h4>
            </CCardHeader>
            <CCardBody>
              <p>Employees management page content will be implemented here.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Employees