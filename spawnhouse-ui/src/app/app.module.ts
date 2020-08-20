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
import { TextboxComponent } from './textbox/textbox.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
