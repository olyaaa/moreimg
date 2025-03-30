// src/components/BlockComponent/BlockComponent.tsx
import React from 'react';
import { Block } from '../../types';

const replaceVariables = (text: string, vars: Record<string, string>) => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
};

export const BlockComponent = ({ block }: { block: Block }) => {
  const variables = { price: "100", logo_url: "logo1.png" };

  switch (block.type) {
    case 'text':
      const text = block.isConstant 
        ? block.content 
        : replaceVariables(block.content || '', variables);
      return <div style={{ position: 'absolute', left: block.x, top: block.y }}>{text}</div>;

    case 'image':
      const urlKey = block.url?.replace(/\{\{|\}\}/g, '') || '';
      const src = block.isConstant ? block.url : variables[urlKey];
      return <img src={src} alt="" style={{ position: 'absolute', left: block.x, top: block.y }} />;

    default:
      return null;
  }
};