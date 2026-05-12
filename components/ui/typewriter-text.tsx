"use client"

import React, { useState, useEffect } from 'react';

export function TypewriterText({ fullText }: { fullText: string }) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timer = setTimeout(() => {
        setText(prev => prev + fullText[index]);
        setIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [index, fullText]);

  return (
    <>
      {text}
      <span className="animate-pulse ml-1 text-[#C7A536]">|</span>
    </>
  );
}
