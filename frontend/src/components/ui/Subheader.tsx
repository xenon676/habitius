import { Link, useLocation } from 'react-router-dom'

function Subheader() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="flex items-center px-4 bg-main-gray2 text-main-gray6">
      <div className="flex">
        <Link 
          to="/inventory/items" 
          className="hover:text-main-teal1 font-medium relative px-6 py-2"
        >
          Items
          {isActive('/inventory/items') && (
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-teal1" />
          )}
        </Link>
        <Link 
          to="/inventory/equipment" 
          className="hover:text-main-teal1 font-medium relative px-6 py-2"
        >
          Equipment
          {isActive('/inventory/equipment') && (
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-teal1" />
          )}
        </Link>
        <Link 
          to="/inventory/pets" 
          className="hover:text-main-teal1 font-medium relative px-6 py-2"
        >
          Pets
          {isActive('/inventory/pets') && (
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-main-teal1" />
          )}
        </Link>
      </div>
    </nav>
  )
}

export default Subheader 