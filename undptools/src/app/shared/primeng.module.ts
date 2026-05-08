import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DrawerModule } from 'primeng/drawer';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { MegaMenuModule } from 'primeng/megamenu';
import { CommonModule } from '@angular/common';

@NgModule({
    exports:[
        ButtonModule,
        InputTextModule,
        RippleModule,
        AvatarModule,
        BadgeModule,
        DrawerModule,
        AnimateOnScrollModule,
        MegaMenuModule,
        CommonModule,
      
    ]
})

export class PrimengModule {}