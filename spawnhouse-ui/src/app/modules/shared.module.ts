import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NavbarService } from 'src/assets/services/navbar.service';
import { ChipsComponent } from '../chips/chips.component';
import { Loader2Component } from '../loader2/loader2.component';
import { MediatextComponent } from '../mediatext/mediatext.component';
import { MinimessageComponent } from '../minimessage/minimessage.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { TextboxComponent } from '../textbox/textbox.component';
import { PipesModule } from './pipes.module';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { ToggleComponent } from '../toggle/toggle.component';
// import { PostMakerComponent } from '../post-maker/post-maker.component';
import { ProgressComponent } from '../progress/progress.component';
import { NowPlayingComponent } from '../now-playing/now-playing.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { ViewPostComponent } from '../view-post/view-post.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    suppressScrollY: true
  };

  
@NgModule({
    declarations: [
        NotFoundComponent,
        Loader2Component,
        TextboxComponent,
        ChipsComponent,
        MinimessageComponent,
        MediatextComponent,
        ToggleComponent,
        // PostMakerComponent,
        ProgressComponent,
        NowPlayingComponent,
        UserCardComponent,
        ViewPostComponent,
    ],
    imports: [
        PipesModule.forRoot(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule,
        PerfectScrollbarModule
    ],
    providers: [
        NavbarService,            
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PipesModule,
        ChipsComponent,
        TextboxComponent,
        MinimessageComponent,
        MediatextComponent,
        Loader2Component,
        PerfectScrollbarModule,
        ToggleComponent,
        // PostMakerComponent,
        ProgressComponent,
        NowPlayingComponent,
        UserCardComponent,
        ViewPostComponent
    ],
    
})

export class SharedModule { }