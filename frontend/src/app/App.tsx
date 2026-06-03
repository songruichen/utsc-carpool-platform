import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/routes/ProtectedRoute';
import { AuthPage } from '@/features/auth/AuthPage';
import { HomePage } from '@/features/home/HomePage';
import { CreateRidePage } from '@/features/rides/CreateRidePage';
import { EditRidePage } from '@/features/rides/EditRidePage';
import { MyRequestsPage } from '@/features/rides/MyRequestsPage';
import { MyRidesPage } from '@/features/rides/MyRidesPage';
import { RideDetailPage } from '@/features/rides/RideDetailPage';
import { RideListPage } from '@/features/rides/RideListPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/rides" element={<RideListPage />} />
          <Route path="/rides/new" element={<CreateRidePage />} />
          <Route path="/rides/:rideId" element={<RideDetailPage />} />
          <Route path="/rides/:rideId/edit" element={<EditRidePage />} />
          <Route path="/my-rides" element={<MyRidesPage />} />
          <Route path="/my-requests" element={<MyRequestsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
