import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { StorageService } from "src/assets/services/storage.service";
import { FeedsComponent } from "../feeds/feeds.component";
import { NpFeedsComponent } from "../np-feeds/np-feeds.component";
import { PipesModule } from "./pipes.module";
import { SharedModule } from "./shared.module";

@NgModule({
    declarations: [
        FeedsComponent,
        NpFeedsComponent
    ],
    imports: [
        CommonModule,
        PipesModule,
        SharedModule
    ],
    exports: [FeedsComponent, NpFeedsComponent],
    providers: [StorageService]
})
export class FeedsModule {}