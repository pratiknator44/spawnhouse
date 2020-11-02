import { NgModule } from '@angular/core';
import { AgoPipe } from 'src/assets/pipes/ago.pipe';
import { ConsoleIconPipe, GameGenrePipe, RandomBgPipe, StreamLinkPipe } from 'src/assets/pipes/gamegenre.pipe';

@NgModule({
    declarations: [
        AgoPipe,
        GameGenrePipe,
        ConsoleIconPipe,
        RandomBgPipe,
        StreamLinkPipe
    ],
    imports: [],
    exports: [
        AgoPipe,
        GameGenrePipe,
        ConsoleIconPipe,
        RandomBgPipe,
        StreamLinkPipe
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