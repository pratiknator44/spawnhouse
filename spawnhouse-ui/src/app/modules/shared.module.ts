import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NavbarService } from 'src/assets/services/navbar.service';
import { ChipsComponent } from '../chips/chips.component';
import { DividerComponent } from '../divider/divider.component';
import { Loader2Component } from '../loader2/loader2.component';
import { MediatextComponent } from '../mediatext/mediatext.component';
import { MinimessageComponent } from '../minimessage/minimessage.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { TextboxComponent } from '../textbox/textbox.component';
import { TimerButtonComponent } from '../timer-button/timer-button.component';
import { PipesModule } from './pipes.module';
import { NgxJoypixelsModule } from 'ngx-joypixels';

@NgModule({
    declarations: [
        NotFoundComponent,
        Loader2Component,
        TextboxComponent,
        ChipsComponent,
        // ImageuploadComponent,
        TimerButtonComponent,
        DividerComponent,
        MinimessageComponent,
        MediatextComponent
    ],
    imports: [
        PipesModule.forRoot(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule,
        NgxJoypixelsModule
    ],
    providers: [
        NavbarService,
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PipesModule,
        ChipsComponent,
        TimerButtonComponent,
        TextboxComponent,
        DividerComponent,
        MinimessageComponent,
        MediatextComponent,
    ]
})

export class SharedModule { }