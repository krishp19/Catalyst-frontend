import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommunityInfo } from '../CommunityInfo';
// Mock the formatDistanceToNow function
const mockFormatDistanceToNow = jest.fn().mockReturnValue('over 5 years ago');

// Mock the date-fns/formatDistanceToNow module
jest.mock('date-fns/formatDistanceToNow', () => ({
  __esModule: true,
  formatDistanceToNow: (...args: any[]) => mockFormatDistanceToNow(...args)
}));

import { formatDistanceToNow } from 'date-fns';
const mockedFormatDistanceToNow = formatDistanceToNow as jest.Mock;

describe('CommunityInfo', () => {
  const defaultProps = {
    communityName: 'Home',
    members: 123456,
    online: 4567,
    createdAt: new Date(2020, 0, 1),
    description: 'Your personalized Catalyst homepage. Come here to check in with your favorite communities.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatDistanceToNow.mockReturnValue('over 5 years ago');
  });

  it('renders with default props', () => {
    render(<CommunityInfo />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('123,456')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('4,567')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('over 5 years ago')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument();
  });

  it('renders community name with r/ prefix for non-Home communities', () => {
    render(<CommunityInfo communityName="testcommunity" />);

    expect(screen.getByText('r/testcommunity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  it('formats numbers correctly for members and online counts', () => {
    render(<CommunityInfo members={1234567} online={890} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('890')).toBeInTheDocument();
  });

  it('calls formatDistanceToNow with correct date', () => {
    const createdAt = new Date(2021, 5, 15);
    
    // Clear any previous calls to the mock
    mockFormatDistanceToNow.mockClear();
    
    render(<CommunityInfo createdAt={createdAt} />);
    
    // Verify the mock was called with the correct arguments
    expect(mockFormatDistanceToNow).toHaveBeenCalledTimes(1);
    expect(mockFormatDistanceToNow.mock.calls[0][0]).toEqual(expect.any(Date));
    expect(mockFormatDistanceToNow.mock.calls[0][1]).toEqual({ addSuffix: true });
    
    // Verify the rendered output
    expect(screen.getByText('over 5 years ago')).toBeInTheDocument();
  });

  it('renders custom description correctly', () => {
    const customDescription = 'This is a test community description';
    render(<CommunityInfo description={customDescription} />);

    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('applies correct styling to card header', () => {
    render(<CommunityInfo />);
    
    const cardTitle = screen.getByRole('heading', { level: 3 });
    const cardHeader = cardTitle.closest('.bg-gradient-to-r');
    expect(cardHeader).toHaveClass('from-blue-500', 'to-purple-500', 'text-white', 'p-3', 'rounded-t-md');
  });

  it('renders button with correct text based on communityName', () => {
    const { rerender } = render(<CommunityInfo communityName="Home" />);
    expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument();

    rerender(<CommunityInfo communityName="testcommunity" />);
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  it('renders icons correctly', () => {
    render(<CommunityInfo />);
    
    // Check for icons by their class names
    expect(document.querySelector('.lucide-users')).toBeInTheDocument();
    expect(document.querySelector('.lucide-eye')).toBeInTheDocument();
    expect(document.querySelector('.lucide-cake')).toBeInTheDocument();
  });

  it('handles zero members and online counts', () => {
    render(<CommunityInfo members={0} online={0} />);

    // Check for both zeros in their respective sections
    const memberCounts = screen.getAllByText('0');
    expect(memberCounts.length).toBe(2);
    expect(memberCounts[0]).toBeInTheDocument();
    expect(memberCounts[1]).toBeInTheDocument();
  });

  it('renders separator between content and footer', () => {
    render(<CommunityInfo />);
    
    // Check for the separator by its class
    const separator = document.querySelector('.shrink-0.bg-border');
    expect(separator).toBeInTheDocument();
  });
});