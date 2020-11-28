import { NgModule } from "@angular/core";
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';
import { ImageuploadComponent } from '../imageupload/imageupload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from './shared.module';
import { StorageService } from 'src/assets/services/storage.service';

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