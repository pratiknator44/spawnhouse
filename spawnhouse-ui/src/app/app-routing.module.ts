import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginGuardService } from 'src/assets/services/login-guard.service';
import { ProfileComponent } from './profile/profile.component';
import { ProfileGuardService } from 'src/assets/services/profile-guard.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuardService]
  }, {
    path: 'profile',
    canActivate: [ProfileGuardService],
    component: ProfileComponent
  },
  //  {
  //   path: '**',
  //   canActivate: [WildcardGuardService],
  //   component: NotfoundComponent
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
