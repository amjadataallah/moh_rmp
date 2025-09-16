import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilDevices,
  cilUser,
  cilLocationPin,
  cilBuilding,
  cilSettings,
  cilBriefcase,
  cilSpeedometer,
  cilUserFollow,
  cilLockLocked,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// Get user role from localStorage
const getUserRole = () => {
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      return userData.role || 'USER'
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }
  return 'USER'
}

// All navigation items
const allNavItems = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
  {
    component: CNavItem,
    name: 'Role Test',
    to: '/test/role-test',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
  {
    component: CNavTitle,
    name: 'Main Operations',
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
  {
    component: CNavItem,
    name: 'Employees',
    to: '/main-operations/employees',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
  {
    component: CNavItem,
    name: 'Devices',
    to: '/main-operations/devices',
    icon: <CIcon icon={cilDevices} customClassName="nav-icon" />,
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/main-operations/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access Users
  },
  {
    component: CNavTitle,
    name: 'System Lookups',
    roles: ['ADMIN'], // Only ADMIN can see System Lookups section
  },
  {
    component: CNavItem,
    name: 'Districts & Centers',
    to: '/system-lookups/districts-centers',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access System Lookups
  },
  {
    component: CNavItem,
    name: 'Equipments',
    to: '/system-lookups/equipments',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access System Lookups
  },
  {
    component: CNavItem,
    name: 'Departments',
    to: '/system-lookups/departments',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access System Lookups
  },
  {
    component: CNavItem,
    name: 'Job Titles',
    to: '/system-lookups/job-titles',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access System Lookups
  },
  {
    component: CNavItem,
    name: 'Constant Data',
    to: '/system-lookups/placements',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access System Lookups
  },
  {
    component: CNavItem,
    name: 'Companies',
    to: '/system-lookups/companies',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access System Lookups
  },
  {
    component: CNavItem,
    name: 'Positions',
    to: '/system-lookups/positions',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
    roles: ['ADMIN'], // Only ADMIN can access System Lookups
  },
  {
    component: CNavTitle,
    name: 'Profile',
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
  {
    component: CNavItem,
    name: 'Profile',
    to: '/profile/profile',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
  {
    component: CNavItem,
    name: 'Logout',
    to: '/logout',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    roles: ['ADMIN', 'MANAGER', 'USER'],
  },
]

// Filter navigation items based on user role
const getFilteredNavigation = () => {
  const userRole = getUserRole()
  return allNavItems.filter((item) => {
    // If no roles defined, show to everyone
    if (!item.roles) return true
    // Check if user role is in the allowed roles for this item
    return item.roles.includes(userRole)
  })
}

const _nav = getFilteredNavigation()

export default _nav
export { getFilteredNavigation }
