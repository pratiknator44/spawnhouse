import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/assets/services/storage.service';
import { SharedModule } from './shared.module';
import { HomeComponent } from '../home/home.component';

@NgModule({
    declarations: [
        HomeComponent,
    ],
    imports: [
        SharedModule,
        CommonModule,
    ],
    providers: [StorageService]
})

export class HomeModule { }