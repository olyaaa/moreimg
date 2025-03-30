import React from 'react';
import { Block } from '../../types';

export const BlockCoords = ({ block }: { block: Block }) => (
  <div className="block-coords">
    <span>ID: {block.id.slice(0, 4)}</span>
    <span>X: {Math.round(block.x)}</span>
    <span>Y: {Math.round(block.y)}</span>
    <span>Z: {block.zIndex}</span>
  </div>
);