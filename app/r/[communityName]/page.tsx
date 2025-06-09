import { communityService } from '../../../src/services/communityService';
import CommunityPageClient from './CommunityPageClient';

export const revalidate = 60; // Revalidate every 60 seconds

// This is required for static exports
export async function generateStaticParams() {
  // Fetch popular communities to pre-render at build time
  try {
    const response = await fetch('http://localhost:3000/api/communities/popular');
    const communities = await response.json();
    return communities.map((community: { name: string }) => ({
      communityName: community.name,
    }));
  } catch (error) {
    console.error('Error generating static params for communities:', error);
    return [];
  }
}

export default async function CommunityPage({ 
  params 
}: { 
  params: { communityName: string } 
}) {
  try {
    // Fetch community data from the API with revalidation
    const response = await fetch(
      `http://localhost:3000/api/communities/${params.communityName}`,
      { next: { revalidate: 60 } } // Revalidate every 60 seconds
    );

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