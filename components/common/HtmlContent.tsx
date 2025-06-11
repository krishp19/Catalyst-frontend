import React from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  html: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ html, className }) => {
  // Sanitize the HTML content
  const cleanHtml = React.useMemo(() => {
    // Configure DOMPurify to allow common HTML tags and attributes
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div',
        'mark', 'sub', 'sup', 'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'class', 'style', 'src', 'alt', 'width', 'height',
        'color', 'background-color', 'text-align', 'font-weight', 'font-style', 'text-decoration'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeypress', 'onkeyup']
    };
    
    return DOMPurify.sanitize(html, config);
  }, [html]);

  // Add some basic styling for common elements
  const content = React.useMemo(() => ({
    __html: cleanHtml
  }), [cleanHtml]);

  return (
    <div 
      className={`prose dark:prose-invert max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={content} 
    />
  );
};

export default HtmlContent;
