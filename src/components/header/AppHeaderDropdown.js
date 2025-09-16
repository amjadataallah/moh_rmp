import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  const { username, role } = userData

  const handleProfileClick = () => {
    navigate('/profile/profile')
  }

  const handleLogoutClick = () => {
    navigate('/logout')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <div className="d-flex align-items-center">
          <div className="text-end me-2">
            <div className="fw-semibold" style={{ fontSize: '0.875rem', lineHeight: '1.2' }}>
              {username || 'User'}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
              {role || 'Role'}
            </div>
          </div>
          <CAvatar
            color="primary"
            size="md"
            style={{
              backgroundColor: '#321fdb',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </CAvatar>
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0 pe-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          Account
        </CDropdownHeader>
        <CDropdownItem onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
