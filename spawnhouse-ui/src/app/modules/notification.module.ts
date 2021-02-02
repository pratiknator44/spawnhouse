import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared.module';
import { AroundyouComponent } from '../aroundyou/aroundyou.component';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';

@NgModule({
    declarations: [
        AroundyouComponent
    ],
    imports: [
        SharedModule,
        CommonModule,
    ],
    providers: [FloatNotificationService]
})

export class NotificationsModule { }