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
import { BrowserModule } from '@angular/platform-browser';
import { APIservice } from 'src/assets/services/api.service';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { FloatNotificationComponent } from './float-notification/float-notification.component';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { PcViewComponent } from './pc-view/pc-view.component';
import { NavbarService } from 'src/assets/services/navbar.service';
import { NavbarComponent } from './navbar/navbar.component';
import { OverlayComponent } from './overlay/overlay.component';
import { OverlayService } from 'src/assets/services/overlay.service';
import { LoaderComponent } from './loader/loader.component';
import { RecepientComponent } from './recepient/recepient.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { SharedModule } from './modules/shared.module';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FloatNotificationComponent,
    PcViewComponent,
    NavbarComponent,
    OverlayComponent,
    LoaderComponent,
    RecepientComponent,
    SuggestionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RecaptchaModule,  //this is the recaptcha main module
    // RecaptchaFormsModule, //this is the module for form incase form validation
    SharedModule,
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
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
