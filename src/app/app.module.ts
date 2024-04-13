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
import { SchoolsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/schools-page/schools-page.component';
import { PreviewInfoBannerComponent } from './components/preview-info-banner/preview-info-banner.component';
import { CreateSchoolPageComponent } from './pages/dashboard-index-page/university-settings-index-page/schools-page/create-school-page/create-school-page.component';
import { EditSchoolPageComponent } from './pages/dashboard-index-page/university-settings-index-page/schools-page/edit-school-page/edit-school-page.component';
import { PreviewUniversityProgramsComponent } from './components/preview-university-programs/preview-university-programs.component';
import { ProgramsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/programs-page.component';
import { CreateProgramPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/create-program-page/create-program-page.component';
import { EditProgramPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/edit-program-page/edit-program-page.component';
import { SubjectsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/subjects-page/subjects-page.component';
import { CreateSubjectPageComponent } from './pages/dashboard-index-page/university-settings-index-page/subjects-page/create-subject-page/create-subject-page.component';
import { EditSubjectPageComponent } from './pages/dashboard-index-page/university-settings-index-page/subjects-page/edit-subject-page/edit-subject-page.component';
import { CreateProgramYearComponent } from './components/create-program-year/create-program-year.component';
import { DropdownSelectPopupComponent } from './components/popups/dropdown-select-popup/dropdown-select-popup.component';
import { EditYearPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/edit-year-page/edit-year-page.component';
import { StudentsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/students-page.component';
import { EditStudentIndexPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/edit-student-index-page.component';
import { PlatformInfoStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/platform-info-student-page/platform-info-student-page.component';
import { ProgramsStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/programs-student-page/programs-student-page.component';
import { ScholarSituationStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/scholar-situation-student-page/scholar-situation-student-page.component';
import { SelectProgramYear } from './components/popups/select-program-year/select-program-year.component';
import { StudentYearsDropdownComponent } from './components/student-years-dropdown/student-years-dropdown.component';
import { OutOfBoxComponent } from './components/out-of-box/out-of-box.component';
import { NumberInputPopupComponent } from './components/popups/number-input-popup/number-input-popup.component';
import { CreateStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/create-student-page/create-student-page.component';
import { NewStudyYearPageComponent } from './pages/dashboard-index-page/university-settings-index-page/new-study-year-page/new-study-year-page.component';
import { CheckmarkPopupComponent } from './components/popups/checkmark-popup/checkmark-popup.component';
import { ClassesPageComponent } from './pages/dashboard-index-page/classes-page/classes-page.component';
import { StudyYearDropdownComponent } from './components/study-year-dropdown/study-year-dropdown.component';
import { ClassPreviewBoxComponent } from './components/class-preview-box/class-preview-box.component';
import { CreateClassPageComponent } from './pages/dashboard-index-page/classes-page/create-class-page/create-class-page.component';
import { ClassIndexPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-index-page.component';
import { ClassHomePageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-home-page/class-home-page.component';
import { ClassAssigmentsPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-assigments-page/class-assigments-page.component';
import { ClassMembersPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-members-page/class-members-page.component';
import { ClassFinalGradesPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-final-grades-page/class-final-grades-page.component';

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
    CreateProfessorPageComponent,
    SchoolsPageComponent,
    PreviewInfoBannerComponent,
    CreateSchoolPageComponent,
    EditSchoolPageComponent,
    PreviewUniversityProgramsComponent,
    ProgramsPageComponent,
    CreateProgramPageComponent,
    EditProgramPageComponent,
    SubjectsPageComponent,
    CreateSubjectPageComponent,
    EditSubjectPageComponent,
    CreateProgramYearComponent,
    DropdownSelectPopupComponent,
    EditYearPageComponent,
    StudentsPageComponent,
    EditStudentIndexPageComponent,
    PlatformInfoStudentPageComponent,
    ProgramsStudentPageComponent,
    ScholarSituationStudentPageComponent,
    SelectProgramYear,
    StudentYearsDropdownComponent,
    OutOfBoxComponent,
    NumberInputPopupComponent,
    CreateStudentPageComponent,
    NewStudyYearPageComponent,
    CheckmarkPopupComponent,
    ClassesPageComponent,
    StudyYearDropdownComponent,
    ClassPreviewBoxComponent,
    CreateClassPageComponent,
    ClassIndexPageComponent,
    ClassHomePageComponent,
    ClassAssigmentsPageComponent,
    ClassMembersPageComponent,
    ClassFinalGradesPageComponent
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
