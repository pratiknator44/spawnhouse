import { NgModule } from '@angular/core';
import { AgoPipe } from 'src/assets/pipes/ago.pipe';
import { ConsoleIconPipe, GameGenrePipe, GamerTypePipe, PLayerTypePipe, RandomBgPipe, StreamLinkPipe } from 'src/assets/pipes/gamegenre.pipe';

@NgModule({
    declarations: [
        AgoPipe,
        GameGenrePipe,
        ConsoleIconPipe,
        RandomBgPipe,
        StreamLinkPipe,
        PLayerTypePipe,
        GamerTypePipe
    ],
    imports: [],
    exports: [
        AgoPipe,
        GameGenrePipe,
        ConsoleIconPipe,
        RandomBgPipe,
        StreamLinkPipe,
        PLayerTypePipe,
        GamerTypePipe
    ],
    providers: []
})
export class PipesModule {
    static forRoot() {
        return {
          ngModule: PipesModule,
          providers: [],
        };
      }
}