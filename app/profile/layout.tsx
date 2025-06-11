import { PrivateRoute } from '../../components/auth/PrivateRoute';

export default function ProfileLayout({
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
