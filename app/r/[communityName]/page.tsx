import { communityService } from '../../../src/services/communityService';
import CommunityPageClient from './CommunityPageClient';

// This is required for static exports
export async function generateStaticParams() {
  // Return an empty array since we're handling all routes client-side
  return [];
}

export default async function CommunityPage({ params }: { params: { communityName: string } }) {
  try {
    // Fetch community data from the API
    const response = await fetch(`http://localhost:3000/api/communities/${params.communityName}`, {
      cache: 'no-store' // This ensures we get fresh data on each request
    });

    if (!response.ok) {
      throw new Error('Community not found');
    }

    const community = await response.json();
    return <CommunityPageClient initialCommunity={community} />;
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Community not found</h1>
      </div>
    );
  }
} 