import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/assets/services/storage.service';
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
    ],
    providers: [StorageService]
})

export class HomeModule { }