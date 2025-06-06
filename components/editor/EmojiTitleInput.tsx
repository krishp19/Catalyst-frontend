'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function EmojiTitleInput({ 
  value, 
  onChange, 
  placeholder = '',
  className = '',
  required = false 
}: EmojiTitleInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const addEmoji = (emoji: any) => {
    onChange(value + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors duration-200 pr-10"
        required={required}
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/50"
              onClick={(e) => {
                e.preventDefault();
                setShowEmojiPicker(!showEmojiPicker);
              }}
            >
              <span className="text-lg">😊</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0 bg-transparent shadow-none">
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
      </div>
    </div>
  );
}
