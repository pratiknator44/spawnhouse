import { NgModule } from "@angular/core";
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';
import { ImageuploadComponent } from '../imageupload/imageupload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from './shared.module';
import { FeedsModule } from "./feeds.module";

@NgModule({
    declarations: [
        ProfileComponent,
        ImageuploadComponent,
        // TextboxComponent
    ],
    imports: [
        SharedModule,
        CommonModule,
        ImageCropperModule,
        FeedsModule
    ],
})

export class ProfileModule { }