import { Editor } from '@tiptap/react';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    textStyle: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export {};
