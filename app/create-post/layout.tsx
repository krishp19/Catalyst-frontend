import { PrivateRoute } from '../../components/auth/PrivateRoute';

export default function CreatePostLayout({
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
