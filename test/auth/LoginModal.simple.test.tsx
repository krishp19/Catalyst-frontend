import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test to verify Jest is working

test('simple test', () => {
  render(<div>Test</div>);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
