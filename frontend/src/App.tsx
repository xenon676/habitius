import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import Navbar from './components/ui/Navbar'
import Header from './components/ui/Header'
import Login from './components/ui/Login'
import Register from './components/ui/Register'
import TaskList from './components/tasks/TaskList'
import InventoryItems from './components/inventory/InventoryItems'
import InventoryEquipment from './components/inventory/InventoryEquipment'
import InventoryPets from './components/inventory/InventoryPets'
import Market from './components/market/Market'
import Themes from './components/market/Themes'
import FixValues from './components/ui/FixValues'
import Settings from './components/ui/Settings'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Header />
        {children}
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <TaskList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/inventory/equipment"
            element={
              <ProtectedLayout>
                <InventoryEquipment />
              </ProtectedLayout>
            }
          />
          <Route
            path="/inventory/items"
            element={
              <ProtectedLayout>
                <InventoryItems />
              </ProtectedLayout>
            }
          />
          <Route
            path="/inventory/pets"
            element={
              <ProtectedLayout>
                <InventoryPets />
              </ProtectedLayout>
            }
          />
          <Route
            path="/shops/market"
            element={
              <ProtectedLayout>
                <Market />
              </ProtectedLayout>
            }
          />
          <Route
            path="/shops/themes"
            element={
              <ProtectedLayout>
                <Themes />
              </ProtectedLayout>
            }
          />
          <Route
            path="/fix-values"
            element={
              <ProtectedLayout>
                <FixValues />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            }
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
