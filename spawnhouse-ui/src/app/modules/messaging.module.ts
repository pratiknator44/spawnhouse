import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { MessagingComponent } from '../messaging/messaging.component';
import { PipesModule } from './pipes.module';
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
        MessagingComponent
    ],
    imports: [
        SharedModule,
        CommonModule,
        PipesModule
    ],
    providers: [
    ],
    exports: [
        MessagingComponent
    ]
})

export class MessagingModule { }