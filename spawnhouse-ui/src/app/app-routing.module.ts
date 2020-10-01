import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginGuardService } from 'src/assets/services/login-guard.service';
import { ProfileComponent } from './profile/profile.component';
import { ProfileGuardService } from 'src/assets/services/profile-guard.service';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuardService]
  }, {
    path: 'profile',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/profile.module').then( m=> m.ProfileModule),
    component: ProfileComponent
  },
   {
    path: '**',
    component: NotFoundComponent
  },
  {
    path: '',
    component: ProfileComponent,
    loadChildren: () => import('./modules/profile.module').then( m=> m.ProfileModule),
    canActivate: [ProfileGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
