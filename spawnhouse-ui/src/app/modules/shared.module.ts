import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NavbarService } from 'src/assets/services/navbar.service';
import { UserService } from 'src/assets/services/user.service';
import { ChipsComponent } from '../chips/chips.component';
import { DividerComponent } from '../divider/divider.component';
import { ImageuploadComponent } from '../imageupload/imageupload.component';
import { Loader2Component } from '../loader2/loader2.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { TextboxComponent } from '../textbox/textbox.component';
import { TimerButtonComponent } from '../timer-button/timer-button.component';
import { PipesModule } from './pipes.module';

@NgModule({
    declarations: [
        NotFoundComponent,
        Loader2Component,
        TextboxComponent,
        ChipsComponent,
        // ImageuploadComponent,
        TimerButtonComponent,
        DividerComponent,

    ],
    imports: [
        PipesModule.forRoot(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule
    ],
    providers: [
        NavbarService,
        UserService
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
    ]
})

export class SharedModule { }