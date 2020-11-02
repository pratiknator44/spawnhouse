import { NgModule } from "@angular/core";
import { ProfileComponent } from '../profile/profile.component';
import { Loader2Component } from '../loader2/loader2.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/assets/services/storage.service';
import { TextboxComponent } from '../textbox/textbox.component';
import { ImageuploadComponent } from '../imageupload/imageupload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
        ProfileComponent,
        ImageuploadComponent,
        // TextboxComponent
    ],
    imports: [
        SharedModule,
        CommonModule,
        ImageCropperModule
    ],
    providers: [StorageService]
})

export class ProfileModule { }