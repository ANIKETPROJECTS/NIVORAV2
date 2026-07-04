import { Navigate } from 'react-router-dom'

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = sessionStorage.getItem('nivora_admin') === 'true'
  if (!isLoggedIn) return <Navigate to="/adminpannel" replace />
  return <>{children}</>
}
