import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared.module';
import { HomeComponent } from '../home/home.component';
import { FeedsModule } from "./feeds.module";

@NgModule({
    declarations: [
        HomeComponent,
    ],
    imports: [
        SharedModule,
        CommonModule,
        FeedsModule
    ]
})

export class HomeModule { }