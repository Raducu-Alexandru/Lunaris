import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page-index/login-page/login-page.component';
import { ChangeUniversityPageComponent } from './pages/login-page-index/change-university-page/change-university-page.component';
import { LoginPageIndexComponent } from './pages/login-page-index/login-page-index.component';
import { environment } from '../environments/environment';
import { AlertConfirmationPopupComponent } from './components/popups/alert-confirmation-popup/alert-confirmation-popup.component';
import { AlertPopupComponent } from './components/popups/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from './components/popups/confirmation-popup/confirmation-popup.component';
import { InfoPopupComponent } from './components/popups/info-popup/info-popup.component';
import { WarningPopupComponent } from './components/popups/warning-popup/warning-popup.component';
import { GeneralPopupComponent } from './components/general-popup/general-popup.component';
import { LogoComponent } from './components/logo/logo.component';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { LoadingWheelComponent } from './components/loading-wheel/loading-wheel.component';
import { BigLoadingFilterComponent } from './components/big-loading-filter/big-loading-filter.component';
import { DashboardIndexPageComponent } from './pages/dashboard-index-page/dashboard-index-page.component';
import { HomePageComponent } from './pages/dashboard-index-page/home-page/home-page.component';
import { ChannelMessageComponent } from './components/channel-message/channel-message.component';
import { TextInputPopupComponent } from './components/popups/text-input-popup/text-input-popup.component';
import { PersonalDetailsPageComponent } from './pages/dashboard-index-page/personal-details-page/personal-details-page.component';
import { UniversitySettingsIndexPageComponent } from './pages/dashboard-index-page/university-settings-index-page/university-settings-index-page.component';
import { GeneralPageComponent } from './pages/dashboard-index-page/university-settings-index-page/general-page/general-page.component';
import { EditPhotoComponent } from './components/edit-photo/edit-photo.component';
import { ImageInputComponent } from './components/image-input/image-input.component';
import { ProfessorsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/professors-page/professors-page.component';
import { AdminsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/admins-page/admins-page.component';
import { EditProfessorPageComponent } from './pages/dashboard-index-page/university-settings-index-page/professors-page/edit-professor-page/edit-professor-page.component';
import { EditAdminPageComponent } from './pages/dashboard-index-page/university-settings-index-page/admins-page/edit-admin-page/edit-admin-page.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { GoBackTextComponent } from './components/go-back-text/go-back-text.component';
import { CreateAdminPageComponent } from './pages/dashboard-index-page/university-settings-index-page/admins-page/create-admin-page/create-admin-page.component';
import { CreateProfessorPageComponent } from './pages/dashboard-index-page/university-settings-index-page/professors-page/create-professor-page/create-professor-page.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    ChangeUniversityPageComponent,
    LoginPageIndexComponent,
    AlertConfirmationPopupComponent,
    AlertPopupComponent,
    ConfirmationPopupComponent,
    InfoPopupComponent,
    WarningPopupComponent,
    GeneralPopupComponent,
    LogoComponent,
    LoadingWheelComponent,
    BigLoadingFilterComponent,
    DashboardIndexPageComponent,
    HomePageComponent,
    ChannelMessageComponent,
    TextInputPopupComponent,
    PersonalDetailsPageComponent,
    UniversitySettingsIndexPageComponent,
    GeneralPageComponent,
    EditPhotoComponent,
    ImageInputComponent,
    ProfessorsPageComponent,
    AdminsPageComponent,
    EditProfessorPageComponent,
    EditAdminPageComponent,
    CheckboxComponent,
    GoBackTextComponent,
    CreateAdminPageComponent,
    CreateProfessorPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    CookieService,
    { provide: 'encryptionServerUrl', useValue: environment.encryptionServerUrl },
    { provide: 'useEncryption', useValue: environment.useEncryption },
    { provide: 'useSocketEncryption', useValue: environment.useSocketEncryption },
    { provide: 'loginUrl', useValue: environment.loginUrl },
    { provide: 'userDetailsUrl', useValue: environment.userDetailsUrl },
    { provide: 'cdnUrl', useValue: environment.cdnUrl },
    { provide: 'notLoggedInRedirectPageArray', useValue: environment.notLoggedInRedirectPageArray },
    { provide: 'loggedInRedirectPageArray', useValue: environment.loggedInRedirectPageArray },
    { provide: 'socketUrl', useValue: environment.socketServerUrl },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
