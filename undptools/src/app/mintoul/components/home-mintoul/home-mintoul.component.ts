import { Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { PhotosphereViewerDirectiveDirective } from '../../photosphere-viewer-directive.directive';


@Component({
  selector: 'app-home-mintoul',
  standalone: true,
  imports: [
     PhotosphereViewerDirectiveDirective
  ],
  templateUrl: './home-mintoul.component.html',
  styleUrl: './home-mintoul.component.scss',
})

export class HomeMintoulComponent {
  viewerConfig = {
    panorama: '../../../assets/images/ke.jpg', 
    // navbar: ['zoom', 'fullscreen'], 
    gyroscope: true
  };

}
