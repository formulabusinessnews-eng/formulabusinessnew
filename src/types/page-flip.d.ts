declare module 'page-flip/dist/js/page-flip.module.js' {
  export type FlipCorner = 'top' | 'bottom';
  export type SizeType = 'fixed' | 'stretch';
  export type Orientation = 'portrait' | 'landscape';
  export type FlippingState = 'user_fold' | 'fold_corner' | 'flipping' | 'read';

  export interface FlipSetting {
    startPage: number;
    size: SizeType;
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number;
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    swipeDistance: number;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  }

  export interface WidgetEvent {
    data: number | string | boolean | object;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Partial<FlipSetting>);
    destroy(): void;
    update(): void;
    loadFromImages(imagesHref: string[]): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(imagesHref: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    clear(): void;
    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(pageNum: number): void;
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    flip(pageNum: number, corner?: FlipCorner): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): Orientation;
    getState(): FlippingState;
    on(eventName: string, callback: (e: WidgetEvent) => void): PageFlip;
    off(eventName: string): void;
  }
}
