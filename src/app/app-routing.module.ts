import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page-index/login-page/login-page.component';
import { LoginPageIndexComponent } from './pages/login-page-index/login-page-index.component';
import { ChangeUniversityPageComponent } from './pages/login-page-index/change-university-page/change-university-page.component';
import { CheckLoginGuard } from './guards/check-login/check-login.guard';
import { AppComponent } from './app.component';
import { DashboardIndexPageComponent } from './pages/dashboard-index-page/dashboard-index-page.component';
import { HomePageComponent } from './pages/dashboard-index-page/home-page/home-page.component';
import { PersonalDetailsPageComponent } from './pages/dashboard-index-page/personal-details-page/personal-details-page.component';
import { UniversitySettingsIndexPageComponent } from './pages/dashboard-index-page/university-settings-index-page/university-settings-index-page.component';
import { CheckUserRoleGuard } from './guards/check-user-role/check-user-role.guard';
import { GeneralPageComponent } from './pages/dashboard-index-page/university-settings-index-page/general-page/general-page.component';
import { ProfessorsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/professors-page/professors-page.component';
import { AdminsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/admins-page/admins-page.component';
import { EditAdminPageComponent } from './pages/dashboard-index-page/university-settings-index-page/admins-page/edit-admin-page/edit-admin-page.component';
import { EditProfessorPageComponent } from './pages/dashboard-index-page/university-settings-index-page/professors-page/edit-professor-page/edit-professor-page.component';
import { CreateProfessorPageComponent } from './pages/dashboard-index-page/university-settings-index-page/professors-page/create-professor-page/create-professor-page.component';
import { CreateAdminPageComponent } from './pages/dashboard-index-page/university-settings-index-page/admins-page/create-admin-page/create-admin-page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AppComponent,
    canActivate: [CheckLoginGuard],
    data: { page: '' },
  },
  {
    path: 'login',
    component: LoginPageIndexComponent,
    canActivate: [CheckLoginGuard],
    data: { page: 'login' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LoginPageComponent
      },
      {
        path: 'change-university',
        component: ChangeUniversityPageComponent
      }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardIndexPageComponent,
    canActivate: [CheckLoginGuard],
    data: { page: 'dashboard' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: HomePageComponent
      },
      {
        path: 'personal-data',
        component: PersonalDetailsPageComponent
      },
      {
        path: 'university-settings',
        component: UniversitySettingsIndexPageComponent,
        canActivate: [CheckUserRoleGuard],
        data: { checkRole: 3 },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'general',
          },
          {
            path: 'general',
            component: GeneralPageComponent
          },
          {
            path: 'professors',
            children: [
              {
                path: '',
                pathMatch: 'full',
                component: ProfessorsPageComponent
              },
              {
                path: 'edit/:professorUserId',
                component: EditProfessorPageComponent
              },
              {
                path: 'create',
                component: CreateProfessorPageComponent
              }
            ]
          },
          {
            path: 'admins',
            children: [
              {
                path: '',
                pathMatch: 'full',
                component: AdminsPageComponent
              },
              {
                path: 'edit/:adminUserId',
                component: EditAdminPageComponent
              },
              {
                path: 'create',
                component: CreateAdminPageComponent
              }
            ]
          },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
