// src/types/colorthief.d.ts
declare module 'colorthief' {
  export default class ColorThief {
    getColor(
      image: HTMLImageElement | HTMLCanvasElement,
      quality?: number
    ): [number, number, number];

    getPalette(
      image: HTMLImageElement | HTMLCanvasElement,
      colorCount?: number,
      quality?: number
    ): [number, number, number][];
  }
}
