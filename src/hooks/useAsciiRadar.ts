import { useMemo } from 'react';
import type { Ability } from '../types';

interface RadarPoint {
  x: number;
  y: number;
  label: string;
  value: number;
  max: number;
}

interface RadarData {
  points: RadarPoint[];
  gridLines: string[][];
}

export const useAsciiRadar = (abilities: Ability[], size: number = 15): RadarData => {
  return useMemo(() => {
    const count = abilities.length;
    if (count === 0) {
      return { points: [], gridLines: [] };
    }

    const centerX = size;
    const centerY = size;
    const maxRadius = size - 2;

    const points: RadarPoint[] = abilities.map((ability, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const ratio = ability.maxScore > 0 ? ability.currentScore / ability.maxScore : 0;
      const r = maxRadius * ratio;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        label: ability.name,
        value: ability.currentScore,
        max: ability.maxScore,
      };
    });

    // Generate empty grid
    const gridLines: string[][] = [];
    for (let y = 0; y <= size * 2; y++) {
      const row: string[] = [];
      for (let x = 0; x <= size * 2; x++) {
        row.push(' ');
      }
      gridLines.push(row);
    }

    // Draw axes
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      for (let r = 1; r <= maxRadius; r++) {
        const ax = Math.round(centerX + r * Math.cos(angle));
        const ay = Math.round(centerY + r * Math.sin(angle));
        if (ax >= 0 && ax <= size * 2 && ay >= 0 && ay <= size * 2) {
          const existing = gridLines[ay][ax];
          gridLines[ay][ax] = existing === ' ' ? '.' : existing;
        }
      }
    }

    // Draw concentric polygons
    const levels = 3;
    for (let level = 1; level <= levels; level++) {
      const lr = (maxRadius * level) / levels;
      const polyPoints: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        polyPoints.push({
          x: centerX + lr * Math.cos(angle),
          y: centerY + lr * Math.sin(angle),
        });
      }
      // Draw edges between consecutive points
      for (let i = 0; i < polyPoints.length; i++) {
        const p1 = polyPoints[i];
        const p2 = polyPoints[(i + 1) % polyPoints.length];
        drawLine(gridLines, p1.x, p1.y, p2.x, p2.y, level === levels ? '+' : ':');
      }
    }

    // Draw ability polygon
    if (points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        drawLine(gridLines, p1.x, p1.y, p2.x, p2.y, '#');
      }
      // Draw vertices
      for (const p of points) {
        const px = Math.round(p.x);
        const py = Math.round(p.y);
        if (px >= 0 && px <= size * 2 && py >= 0 && py <= size * 2) {
          gridLines[py][px] = '@';
        }
      }
    }

    // Center marker
    gridLines[centerY][centerX] = '+';

    return { points, gridLines };
  }, [abilities, size]);
};

function drawLine(grid: string[][], x0: number, y0: number, x1: number, y1: number, char: string) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    if (rx >= 0 && rx < grid[0].length && ry >= 0 && ry < grid.length) {
      const existing = grid[ry][rx];
      if (existing === ' ' || existing === '.' || existing === ':') {
        grid[ry][rx] = char;
      }
    }
    if (Math.abs(x - x1) < 0.5 && Math.abs(y - y1) < 0.5) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}
