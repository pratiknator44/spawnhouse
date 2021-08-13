import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared.module';
import { AllNotificationsComponent } from "../all-notifications/all-notifications.component";
import { NotificationsComponent } from "../notifications/notifications.component";

@NgModule({
    declarations: [
        AllNotificationsComponent
    ],
    imports: [
        SharedModule,
        CommonModule,
    ],
    providers: []
})

export class NotificationsModule { }