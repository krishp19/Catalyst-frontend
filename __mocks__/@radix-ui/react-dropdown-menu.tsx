import * as React from 'react';

// Create a component factory that handles both the component and its displayName
const createComponent = (displayName: string) => {
  const Component = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props} data-testid={displayName.toLowerCase()}>
      {children}
    </div>
  ));
  Component.displayName = displayName;
  return Component;
};

// Create all the components with their display names
const DropdownMenu = createComponent('DropdownMenu');
const DropdownMenuTrigger = createComponent('DropdownMenuTrigger');
const DropdownMenuContent = createComponent('DropdownMenuContent');
const DropdownMenuItem = createComponent('DropdownMenuItem');
const DropdownMenuCheckboxItem = createComponent('DropdownMenuCheckboxItem');
const DropdownMenuRadioItem = createComponent('DropdownMenuRadioItem');
const DropdownMenuLabel = createComponent('DropdownMenuLabel');
const DropdownMenuSeparator = createComponent('DropdownMenuSeparator');
const DropdownMenuShortcut = createComponent('DropdownMenuShortcut');
const DropdownMenuGroup = createComponent('DropdownMenuGroup');
const DropdownMenuPortal = createComponent('DropdownMenuPortal');
const DropdownMenuSub = createComponent('DropdownMenuSub');
const DropdownMenuSubTrigger = createComponent('DropdownMenuSubTrigger');
const DropdownMenuSubContent = createComponent('DropdownMenuSubContent');
const DropdownMenuRadioGroup = createComponent('DropdownMenuRadioGroup');
const DropdownMenuItemIndicator = createComponent('DropdownMenuItemIndicator');

// Create the primitive object with all components
const DropdownMenuPrimitive = {
  Root: DropdownMenu,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Group: DropdownMenuGroup,
  Portal: DropdownMenuPortal,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
  RadioGroup: DropdownMenuRadioGroup,
  ItemIndicator: DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuItemIndicator,
};

// Set display names for primitive components
DropdownMenuPrimitive.CheckboxItem.displayName = 'DropdownMenuPrimitive.CheckboxItem';
DropdownMenuPrimitive.RadioItem.displayName = 'DropdownMenuPrimitive.RadioItem';
DropdownMenuPrimitive.SubTrigger.displayName = 'DropdownMenuPrimitive.SubTrigger';
DropdownMenuPrimitive.SubContent.displayName = 'DropdownMenuPrimitive.SubContent';

// Export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuItemIndicator,
  DropdownMenuPrimitive,
};

export default DropdownMenuPrimitive;