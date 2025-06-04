import Sidebar from '../../../components/layout/Sidebar';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 