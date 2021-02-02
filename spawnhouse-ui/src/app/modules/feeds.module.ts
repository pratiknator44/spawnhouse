import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { StorageService } from "src/assets/services/storage.service";
import { FeedsComponent } from "../feeds/feeds.component";
import { PipesModule } from "./pipes.module";

@NgModule({
    declarations: [
        FeedsComponent
    ],
    imports: [
        CommonModule,
        PipesModule
    ],
    exports: [FeedsComponent],
    providers: [StorageService]
})
export class FeedsModule {}