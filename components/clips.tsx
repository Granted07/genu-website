"use client";

import { div } from "framer-motion/m";

import React from 'react'
import ReactMarkdown from 'react-markdown'

interface ClipProps {
  title: string;
  description: string | React.ReactNode;
  image?: string;
  className?: string;
}



export function Clip1({ title, description, image, className }: ClipProps) {
  return (
    <>
      <div className={`bg-[url(${image})] clip ${className}`}>
  <div className="absolute inset-0 bg-white/80 z-0"></div>
        <h1 className="clip-heading">{title || ''}</h1>

        <div className="clip-body">
          {typeof description === 'string' ? <ReactMarkdown>{description}</ReactMarkdown> : description}
        </div>
      </div>
    </>
  );
}

// export function Clip2({ title, description, image, className }: ClipProps) {
//   return (
//     <div className={`bg-[url(${image})] clip2 ${className}`}>
//       <div className="absolute inset-0 bg-white/80"></div>

//       <h1 className="clip2-heading">{title || ''}</h1>

//       <div className="clip2-body">{typeof description === 'string' ? <ReactMarkdown>{description}</ReactMarkdown> : description}</div>
//     </div>
//   );
// }
