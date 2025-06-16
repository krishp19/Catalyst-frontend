import * as React from 'react';
const { forwardRef } = React;

type ReactNode = React.ReactNode;

export const Root = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
export const Trigger = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
export const Portal = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
export const Content = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
export const Item = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
export const Group = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
export const Sub = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);

export const SubTrigger = forwardRef(({ children }: { children: ReactNode }, ref: React.Ref<HTMLDivElement>) => 
  React.createElement('div', { ref }, children)
);
SubTrigger.displayName = 'SubTrigger';

export const SubContent = forwardRef(({ children }: { children: ReactNode }, ref: React.Ref<HTMLDivElement>) => 
  React.createElement('div', { ref }, children)
);
SubContent.displayName = 'SubContent';

export const RadioGroup = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
export const RadioItem = ({ children }: { children: ReactNode }) => React.createElement('div', null, children);

// Add other DropdownMenuPrimitive components as needed

export default {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  Group,
  Sub,
  SubTrigger,
  SubContent,
  RadioGroup,
  RadioItem,
};
