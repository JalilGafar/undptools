import { ElementRef } from '@angular/core';
import { PhotosphereViewerDirectiveDirective } from './photosphere-viewer-directive.directive';

describe('PhotosphereViewerDirectiveDirective', () => {
  it('should create an instance', () => {
    const elRef = { nativeElement: document.createElement('div') } as ElementRef;
    const directive = new PhotosphereViewerDirectiveDirective(elRef);
    expect(directive).toBeTruthy();
  });
});
