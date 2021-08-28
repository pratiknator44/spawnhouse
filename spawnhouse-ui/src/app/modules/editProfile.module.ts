import { NgModule } from "@angular/core";
import { ProfileManagementComponent } from '../profile-management/profile-management.component';
import { PushNotificationComponent } from "../push-notification/push-notification.component";
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
        ProfileManagementComponent,
        PushNotificationComponent
    ],
    imports: [
        SharedModule,
    ],
    providers: [
    ],
    exports: []
})

export class ProfileEditModule { }