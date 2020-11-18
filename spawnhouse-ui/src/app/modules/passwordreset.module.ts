import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { PasswordresetComponent } from '../passwordreset/passwordreset.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        PasswordresetComponent
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
})

export class ResetModule { }