import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { Viewer } from '@photo-sphere-viewer/core';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';

@Directive({
  selector: '[photoSphereViewer]',
  standalone: true
})
export class PhotosphereViewerDirectiveDirective implements AfterViewInit {


  @Input('photoSphereViewer') viewerConfig: any = {};
  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    new Viewer({
      container: this.el.nativeElement,
      plugins: [
        GyroscopePlugin,
      ],
      ...this.viewerConfig,
    });
  }

}
