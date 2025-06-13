import React from 'react';

const MockDropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-menu">{children}</div>
);

const MockDropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-trigger">{children}</div>
);

const MockDropdownMenuContent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-content">{children}</div>
);

const MockDropdownMenuItem = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-item">{children}</div>
);

const MockDropdownMenuSeparator = () => <hr data-testid="dropdown-separator" />;

const MockDropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-label">{children}</div>
);

const MockDropdownMenuGroup = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-group">{children}</div>
);

const MockDropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-checkbox-item">{children}</div>
);

const MockDropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-radio-group">{children}</div>
);

const MockDropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-radio-item">{children}</div>
);

const MockDropdownMenuSub = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-sub">{children}</div>
);

const MockDropdownMenuSubTrigger = React.forwardRef(({ children, ...props }: any, ref: any) => (
  <div ref={ref} {...props} data-testid="dropdown-sub-trigger">
    {children}
  </div>
));

const MockDropdownMenuSubContent = React.forwardRef(({ children, ...props }: any, ref: any) => (
  <div ref={ref} {...props} data-testid="dropdown-sub-content">
    {children}
  </div>
));

const MockDropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => (
  <span data-testid="dropdown-shortcut">{children}</span>
);

// Set display names for components
MockDropdownMenu.displayName = 'DropdownMenu';
MockDropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
MockDropdownMenuContent.displayName = 'DropdownMenuContent';
MockDropdownMenuItem.displayName = 'DropdownMenuItem';
MockDropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
MockDropdownMenuLabel.displayName = 'DropdownMenuLabel';
MockDropdownMenuGroup.displayName = 'DropdownMenuGroup';
MockDropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
MockDropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
MockDropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
MockDropdownMenuSub.displayName = 'DropdownMenuSub';
MockDropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';
MockDropdownMenuSubContent.displayName = 'DropdownMenuSubContent';
MockDropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  MockDropdownMenu as DropdownMenu,
  MockDropdownMenuTrigger as DropdownMenuTrigger,
  MockDropdownMenuContent as DropdownMenuContent,
  MockDropdownMenuItem as DropdownMenuItem,
  MockDropdownMenuSeparator as DropdownMenuSeparator,
  MockDropdownMenuLabel as DropdownMenuLabel,
  MockDropdownMenuGroup as DropdownMenuGroup,
  MockDropdownMenuCheckboxItem as DropdownMenuCheckboxItem,
  MockDropdownMenuRadioGroup as DropdownMenuRadioGroup,
  MockDropdownMenuRadioItem as DropdownMenuRadioItem,
  MockDropdownMenuSub as DropdownMenuSub,
  MockDropdownMenuSubTrigger as DropdownMenuSubTrigger,
  MockDropdownMenuSubContent as DropdownMenuSubContent,
  MockDropdownMenuShortcut as DropdownMenuShortcut,
};
