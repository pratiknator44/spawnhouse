import { NgModule } from "@angular/core";
import { ProfileManagementComponent } from '../profile-management/profile-management.component';
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
        ProfileManagementComponent,
    ],
    imports: [
        SharedModule,
    ],
    providers: [
    ],
    exports: []
})

export class ProfileEditModule { }