import React from 'react';

// Create a simple mock for the dropdown menu primitives
const DropdownMenuPrimitive = {
  SubTrigger: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props} data-testid="dropdown-sub-trigger">
      {children}
    </div>
  )),
  SubContent: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props} data-testid="dropdown-sub-content">
      {children}
    </div>
  )),
};

// Set display names
DropdownMenuPrimitive.SubTrigger.displayName = 'DropdownMenuPrimitive.SubTrigger';
DropdownMenuPrimitive.SubContent.displayName = 'DropdownMenuPrimitive.SubContent';

// Create the main dropdown menu component
const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-menu">{children}</div>
);

// Create other dropdown menu components
const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-trigger">{children}</div>
);

const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-content">{children}</div>
);

const DropdownMenuItem = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-item">{children}</div>
);

const DropdownMenuSeparator = () => <hr data-testid="dropdown-separator" />;

const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-label">{children}</div>
);

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-group">{children}</div>
);

const DropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-checkbox-item">{children}</div>
);

const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-radio-group">{children}</div>
);

const DropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-radio-item">{children}</div>
);

const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dropdown-sub">{children}</div>
);

const DropdownMenuSubTrigger = DropdownMenuPrimitive.SubTrigger;
const DropdownMenuSubContent = DropdownMenuPrimitive.SubContent;

const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => (
  <span data-testid="dropdown-shortcut">{children}</span>
);

// Set display names
DropdownMenu.displayName = 'DropdownMenu';
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
DropdownMenuContent.displayName = 'DropdownMenuContent';
DropdownMenuItem.displayName = 'DropdownMenuItem';
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
DropdownMenuLabel.displayName = 'DropdownMenuLabel';
DropdownMenuGroup.displayName = 'DropdownMenuGroup';
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
DropdownMenuSub.displayName = 'DropdownMenuSub';
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
};
