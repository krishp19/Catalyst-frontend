import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export interface FontSizeOptions {
  types: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions(): FontSizeOptions {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const size = element.style.fontSize?.replace(/['"]+/g, '');
              return size || null;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: size })
            .setMeta('preventInputRules', true)
            .run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-1': () => this.editor.commands.setFontSize('1rem'),
      'Mod-Shift-2': () => this.editor.commands.setFontSize('1.25rem'),
      'Mod-Shift-3': () => this.editor.commands.setFontSize('1.5rem'),
      'Mod-Shift-0': () => this.editor.commands.unsetFontSize(),
    };
  },
});
