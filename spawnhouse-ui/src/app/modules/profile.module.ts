import { NgModule } from "@angular/core";
import { ProfileComponent } from '../profile/profile.component';
import { NotfoundComponent } from '../notfound/notfound.component';
import { LoaderComponent } from '../loader/loader.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { Loader2Component } from '../loader2/loader2.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from 'src/assets/services/storage.service';
import { TextboxComponent } from '../textbox/textbox.component';

@NgModule({
    declarations: [
        ProfileComponent,
        NotfoundComponent,
        LoaderComponent,
        NavbarComponent,
        Loader2Component,
        TextboxComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [StorageService]
})

export class ProfileModule { }