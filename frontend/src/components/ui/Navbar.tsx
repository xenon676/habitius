import React, { useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TerminalIcon, CurrencyCircleDollarIcon, UserIcon } from '@phosphor-icons/react'
import Tooltip from './Tooltip'
import { useAuth } from '../../contexts/AuthContext'

const formatGold = (gold: number): string => {
  return gold < 10 ? gold.toFixed(2) : gold.toFixed(1);
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const [showInventoryDropdown, setShowInventoryDropdown] = React.useState(false)
  const [showShopsDropdown, setShowShopsDropdown] = React.useState(false)
  const [showUserDropdown, setShowUserDropdown] = React.useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isActive = (path: string) => {
    if (path === '/tasks') {
      return location.pathname === '/' || location.pathname.startsWith('/tasks')
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleUserDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowUserDropdown(!showUserDropdown)
  }

  if (!user) {
    return null
  }

  return (
    <nav className="flex items-center justify-between px-4 bg-main-gray7 text-main-white">
      <div className="flex items-center">
        {/* App Icon */}
        <Link to="/" className="flex items-center gap-2 mr-6">
          <TerminalIcon size={24} weight="bold" />
          <span className="text-xl font-medium">Habitius</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex">
          <Link 
            to="/tasks" 
            className="font-medium relative px-6 py-2 hover:bg-main-gray6"
          >
            Tasks
            {isActive('/tasks') && (
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-cyan" />
            )}
          </Link>
          <div 
            className="relative"
            onMouseEnter={() => setShowInventoryDropdown(true)}
            onMouseLeave={() => setShowInventoryDropdown(false)}
          >
            <Link 
              to="/inventory/items"
              className="font-medium relative px-6 py-2 inline-block hover:bg-main-gray6"
            >
              Inventory
              {isActive('/inventory') && (
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-cyan" />
              )}
            </Link>
            {showInventoryDropdown && (
              <div className="absolute top-full left-0 bg-main-gray7 shadow-lg min-w-[120px]">
                <Link 
                  to="/inventory/items"
                  className="block px-4 py-2 hover:bg-main-gray6"
                >
                  Items
                </Link>
                <Link 
                  to="/inventory/equipment"
                  className="block px-4 py-2 hover:bg-main-gray6"
                >
                  Equipment
                </Link>
                <Link 
                  to="/inventory/pets"
                  className="block px-4 py-2 hover:bg-main-gray6"
                >
                  Pets
                </Link>
              </div>
            )}
          </div>
          <div 
            className="relative"
            onMouseEnter={() => setShowShopsDropdown(true)}
            onMouseLeave={() => setShowShopsDropdown(false)}
          >
            <Link 
              to="/shops/market"
              className="font-medium relative px-6 py-2 inline-block hover:bg-main-gray6"
            >
              Shop
              {isActive('/shops') && (
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-cyan" />
              )}
            </Link>
            {showShopsDropdown && (
              <div className="absolute top-full left-0 bg-main-gray7 shadow-lg min-w-[120px]">
                <Link 
                  to="/shops/market"
                  className="block px-4 py-2 hover:bg-main-gray6"
                >
                  Market
                </Link>
                <Link 
                  to="/shops/themes"
                  className="block px-4 py-2 hover:bg-main-gray6"
                >
                  Themes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Money Icon */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <CurrencyCircleDollarIcon size={24} weight="bold" />
            <div className="absolute top-full left-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Tooltip type="small" text="Gold" />
            </div>
          </div>
          <span className="font-medium">{formatGold(user.gold)}</span>
        </div>

        {/* User Icon with Dropdown */}
        <div 
          ref={userDropdownRef}
          className="relative"
        >
          <div 
            onClick={toggleUserDropdown}
            className="w-8 h-8 bg-main-gray7 rounded-full flex items-center justify-center cursor-pointer hover:bg-main-gray6"
          >
            <UserIcon size={20} weight="bold" />
          </div>
          {showUserDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-main-gray7 shadow-lg min-w-[120px]">
              <Link 
                to="/settings"
                className="block px-4 py-2 hover:bg-main-gray6"
                onClick={() => setShowUserDropdown(false)}
              >
                Settings
              </Link>
              <Link 
                to="/fix-values"
                className="block px-4 py-2 hover:bg-main-gray6"
                onClick={() => setShowUserDropdown(false)}
              >
                Fix Values
              </Link>
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleLogout()
                }}
                className="block px-4 py-2 hover:bg-main-gray6 cursor-pointer"
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar 