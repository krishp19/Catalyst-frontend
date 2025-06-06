'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { FontSize } from '../../lib/extensions/font-size';
import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Code2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Image as ImageIcon,
  Link2,
  SmilePlus,
  X,
  Type,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Toggle } from '../ui/toggle';
import { toast } from 'sonner';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Write something amazing...',
  className 
}: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Typography,
      Highlight,
      Subscript,
      Superscript,
      FontSize,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Enter the URL of the image:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url })
      .run();
  }, [editor]);

  const addEmoji = useCallback((emoji: any) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    editor.chain().focus().insertContentAt(
      { from, to },
      {
        type: 'text',
        text: emoji.native,
      }
    ).run();
    
    setShowEmojiPicker(false);
  }, [editor]);

  const setTextColor = useCallback((color: string) => {
    if (!editor) return;
    
    editor.chain().focus().setColor(color).run();
    setSelectedColor(color);
    setOpenColorPicker(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
  ];

  return (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900', className)}>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Code2 className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
      
      <div className="border-b border-gray-100 dark:border-gray-700 p-2 flex flex-wrap items-center gap-1 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <select
            className="text-sm bg-transparent border-none focus:ring-0 focus:ring-offset-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            value={editor.getAttributes('textStyle')?.fontSize || '1rem'}
            onChange={(e) => {
              const size = e.target.value;
              if (size === '1rem') {
                editor.chain().focus().unsetFontSize().run();
              } else {
                editor.chain().focus().setFontSize(size).run();
              }
            }}
          >
            <option value="1rem">Text</option>
            <option value="1.25rem">Large</option>
            <option value="1.5rem">Larger</option>
            <option value="1.75rem">Largest</option>
            <option value="2rem">Heading</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Code2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <Popover open={openColorPicker} onOpenChange={setOpenColorPicker}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-6 gap-2">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    className="w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-300"
                    style={{ backgroundColor: color.value }}
                    onClick={() => setTextColor(color.value)}
                    title={color.name}
                  />
                ))}
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 cursor-pointer"
                  title="Custom color"
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Text Color
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <SmilePlus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto border-0 bg-transparent shadow-none">
              <Picker 
                data={data} 
                onEmojiSelect={addEmoji} 
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                previewPosition="none"
                skinTonePosition="none"
                set="native"
                perLine={8}
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={editor.isActive('subscript') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <SubscriptIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={editor.isActive('superscript') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <SuperscriptIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showLinkInput && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Paste or type a link..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (linkUrl) {
                editor.chain().focus().setLink({ href: linkUrl }).run();
                setShowLinkInput(false);
                setLinkUrl('');
              }
            }}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto bg-white dark:bg-gray-900">
        <EditorContent 
          editor={editor} 
          className="prose dark:prose-invert max-w-none prose-headings:mt-0 
                   focus:outline-none focus:ring-0 focus:ring-offset-0
                   [&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:p-0
                   [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_pre]:my-2 [&_blockquote]:my-2" 
        />
      </div>
    </div>
  );
}
