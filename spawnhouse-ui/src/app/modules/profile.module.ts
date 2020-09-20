import { NgModule } from "@angular/core";
import { ProfileComponent } from '../profile/profile.component';
import { NotfoundComponent } from '../notfound/notfound.component';
import { LoaderComponent } from '../loader/loader.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { Loader2Component } from '../loader2/loader2.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/assets/services/storage.service';
import { TextboxComponent } from '../textbox/textbox.component';
import { ImageuploadComponent } from '../imageupload/imageupload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FloatNotificationComponent } from '../float-notification/float-notification.component';

@NgModule({
    declarations: [
        ProfileComponent,
        NotfoundComponent,
        LoaderComponent,
        NavbarComponent,
        Loader2Component,
        TextboxComponent,
        ImageuploadComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule
    ],
    providers: [StorageService]
})

export class ProfileModule { }