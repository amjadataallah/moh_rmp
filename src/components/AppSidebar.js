import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config - import the function instead of the static array
import { getFilteredNavigation } from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  
  // State for dynamic navigation
  const [navigation, setNavigation] = useState([])

  // Update navigation when component mounts or user data changes
  useEffect(() => {
    const updateNavigation = () => {
      const nav = getFilteredNavigation()
      setNavigation(nav)
    }

    updateNavigation()
    
    // Listen for localStorage changes (when user logs in/out)
    const handleStorageChange = () => {
      updateNavigation()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <img
            src="/logo.png"
            alt="Logo"
            style={{ height: '32px', width: 'auto' }}
            className="sidebar-brand-full"
          />
          <img
            src="/logo.png"
            alt="Logo"
            style={{ height: '32px', width: 'auto' }}
            className="sidebar-brand-narrow"
          />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
