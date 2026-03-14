import { Link, useLocation } from 'react-router-dom'

function ShopSubheader() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="flex items-center px-4 bg-main-gray2 text-main-gray6">
      <div className="flex">
        <Link 
          to="/shops/market" 
          className="hover:text-main-teal1 font-medium relative px-6 py-2"
        >
          Market
          {isActive('/shops/market') && (
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-teal1" />
          )}
        </Link>
        <Link 
          to="/shops/themes" 
          className="hover:text-main-teal1 font-medium relative px-6 py-2"
        >
          Themes
          {isActive('/shops/themes') && (
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-teal1" />
          )}
        </Link>
      </div>
    </nav>
  )
}

export default ShopSubheader 