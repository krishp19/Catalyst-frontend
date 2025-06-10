import { communityService } from '../../../src/services/communityService';
import CommunityPageClient from './CommunityPageClient';

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  // Return an empty array to opt-out of static generation at build time
  // Pages will be generated on first request and then cached
  return [];
}

export default async function CommunityPage({ 
  params 
}: { 
  params: { communityName: string } 
}) {
  try {
    // Fetch community data from the API with revalidation
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(
      `${apiUrl}/api/communities/${params.communityName}`,
      { 
        next: { revalidate: 60 }, // Revalidate every 60 seconds
        credentials: 'include' // Include cookies for authentication
      }
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