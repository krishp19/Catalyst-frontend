import { PrivateRoute } from '../../components/auth/PrivateRoute';

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      {children}
    </PrivateRoute>
  );
}
