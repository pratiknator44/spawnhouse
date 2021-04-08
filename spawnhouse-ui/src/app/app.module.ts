import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from 'src/assets/services/interceptors';
import { StorageService } from 'src/assets/services/storage.service';
import { LoginGuardService } from 'src/assets/services/login-guard.service';
import { ProfileGuardService } from 'src/assets/services/profile-guard.service';
import { WildcardGuardService } from 'src/assets/services/wildcard-guard.service';
import { BrowserModule, Title } from '@angular/platform-browser';
import { APIservice } from 'src/assets/services/api.service';
import { RecaptchaModule } from 'ng-recaptcha';
import { FloatNotificationComponent } from './float-notification/float-notification.component';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { PcViewComponent } from './pc-view/pc-view.component';
import { NavbarService } from 'src/assets/services/navbar.service';
import { NowplayingService } from 'src/assets/services/now-playing.service';
import { NavbarComponent } from './navbar/navbar.component';
import { OverlayComponent } from './overlay/overlay.component';
import { OverlayService } from 'src/assets/services/overlay.service';
import { RecepientComponent } from './recepient/recepient.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { SharedModule } from './modules/shared.module';
import { AroundYouModule } from './modules/aroundyou.module';
import { CookieService } from 'ngx-cookie-service';
import { ToastComponent } from './toast/toast.component';
import { UserService } from 'src/assets/services/user.service';
import { DialogComponent } from './dialog/dialog.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { NowPlayingSideDockComponent } from './now-playing-side-dock/now-playing-side-dock.component';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { AboutComponent } from './about/about.component';
import { ModalComponent } from './modal/modal.component';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalAboutComponent } from './modal-about/modal-about.component';
import { RedirectComponent } from './redirect/redirect.component';

const config: SocketIoConfig = { url: APIvars.APIdomain, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FloatNotificationComponent,
    PcViewComponent,
    NavbarComponent,
    OverlayComponent,
    RecepientComponent,
    SuggestionsComponent,
    ToastComponent,
    DialogComponent,
    NotificationsComponent,
    NowPlayingSideDockComponent,
    AboutComponent,
    ModalComponent,
    ModalAboutComponent,
    RedirectComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RecaptchaModule,  //this is the recaptcha main module
    // RecaptchaFormsModule, //this is the module for form incase form validation
    AroundYouModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    SocketIoModule.forRoot(config),
    NgbTooltipModule,
    NgbModule
],
  exports: [
  ],
  providers: [{ 
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  },
    StorageService,
    LoginGuardService,
    ProfileGuardService,
    WildcardGuardService,
    APIservice,
    FloatNotificationService,
    NavbarService,
    OverlayService,
    CookieService,
    UserService,
    Title,
    NowplayingService,
  ],
  bootstrap: [AppComponent],
  
  entryComponents: [
    ModalAboutComponent
  ]
})
export class AppModule { }
