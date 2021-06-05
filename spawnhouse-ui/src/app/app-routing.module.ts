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
import { AroundyouComponent } from './aroundyou/aroundyou.component';
import { MessagingComponent } from './messaging/messaging.component';
import { AboutComponent } from './about/about.component';
import { ViewPostComponent } from './view-post/view-post.component';
import { RedirectComponent } from './redirect/redirect.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AllNotificationsComponent } from './all-notifications/all-notifications.component';

const routes: Routes = [
  {
    path: '',
    component: RedirectComponent,
  },
  {
    path: 'home',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/home.module').then( m=> m.HomeModule),
    component: HomeComponent
  },
  {
    path: 'feedback',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/home.module').then( m=> m.HomeModule),
    component: FeedbackComponent
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
    path: 'aroundyou',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/aroundyou.module').then( m => m.AroundYouModule),
    component: AroundyouComponent
  },
  {
    path: 'messaging',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/messaging.module').then(m => m.MessagingModule),
    component: MessagingComponent
  },
  {
    path: 'view-post/:postid',
    canActivate: [ProfileGuardService],
    component: ViewPostComponent
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
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'all-notifications',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/notification.module').then(m=> m.NotificationsModule),
    component: AllNotificationsComponent
  },
  
  {
    path: ':username',
    canActivate: [ProfileGuardService],
    loadChildren: () => import('./modules/profile.module').then( m=> m.ProfileModule),
    component: ProfileComponent
  }, 
  // { path: '',   redirectTo: '/login', pathMatch: 'full' }, // redirect to `first-component`
   {
    path: '**',
    component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
