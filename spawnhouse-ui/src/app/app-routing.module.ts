import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginGuardService } from 'src/assets/services/login-guard.service';
import { ProfileComponent } from './profile/profile.component';
import { ProfileGuardService } from 'src/assets/services/profile-guard.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProfileManagementComponent } from './profile-management/profile-management.component';
import { HomeComponent } from './home/home.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/home.module').then( m=> m.HomeModule),
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuardService]
  }, 
  {
    path: 'profile',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/profile.module').then( m=> m.ProfileModule),
    component: ProfileComponent
  },
  {
    path: 'manage',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/editProfile.module').then(m=> m.ProfileEditModule),
    component: ProfileManagementComponent
  },
  {
    path: 'resetpassword/:token',
    loadChildren: () => import('./modules/passwordreset.module').then(m=> m.ResetModule),
    component: PasswordresetComponent
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },
  {
    path: ':username',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/profile.module').then( m=> m.ProfileModule),
    component: ProfileComponent
  }, 
   {
    path: '**',
    component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
