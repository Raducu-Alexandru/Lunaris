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
import { SchoolsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/schools-page/schools-page.component';
import { CreateSchoolPageComponent } from './pages/dashboard-index-page/university-settings-index-page/schools-page/create-school-page/create-school-page.component';
import { EditSchoolPageComponent } from './pages/dashboard-index-page/university-settings-index-page/schools-page/edit-school-page/edit-school-page.component';
import { ProgramsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/programs-page.component';
import { CreateProgramPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/create-program-page/create-program-page.component';
import { EditProgramPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/edit-program-page/edit-program-page.component';
import { SubjectsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/subjects-page/subjects-page.component';
import { CreateSubjectPageComponent } from './pages/dashboard-index-page/university-settings-index-page/subjects-page/create-subject-page/create-subject-page.component';
import { EditSubjectPageComponent } from './pages/dashboard-index-page/university-settings-index-page/subjects-page/edit-subject-page/edit-subject-page.component';
import { EditYearPageComponent } from './pages/dashboard-index-page/university-settings-index-page/programs-page/edit-year-page/edit-year-page.component';
import { StudentsPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/students-page.component';
import { EditStudentIndexPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/edit-student-index-page.component';
import { PlatformInfoStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/platform-info-student-page/platform-info-student-page.component';
import { ScholarSituationStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/scholar-situation-student-page/scholar-situation-student-page.component';
import { ProgramsStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/edit-student-index-page/programs-student-page/programs-student-page.component';
import { CreateStudentPageComponent } from './pages/dashboard-index-page/university-settings-index-page/students-page/create-student-page/create-student-page.component';
import { NewStudyYearPageComponent } from './pages/dashboard-index-page/university-settings-index-page/new-study-year-page/new-study-year-page.component';
import { ClassesPageComponent } from './pages/dashboard-index-page/classes-page/classes-page.component';
import { CreateClassPageComponent } from './pages/dashboard-index-page/classes-page/create-class-page/create-class-page.component';
import { ClassIndexPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-index-page.component';
import { ClassHomePageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-home-page/class-home-page.component';
import { ClassAssigmentsPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-assigments-page/class-assigments-page.component';
import { ClassMembersPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-members-page/class-members-page.component';
import { ClassFinalGradesPageComponent } from './pages/dashboard-index-page/classes-page/class-index-page/class-final-grades-page/class-final-grades-page.component';
import { ScholarSituationPageComponent } from './pages/dashboard-index-page/scholar-situation-page/scholar-situation-page.component';

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
				component: LoginPageComponent,
			},
			{
				path: 'change-university',
				component: ChangeUniversityPageComponent,
			},
		],
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
				component: HomePageComponent,
			},
			{
				path: 'personal-data',
				component: PersonalDetailsPageComponent,
			},
			{
				path: 'scholar-situation',
				component: ScholarSituationPageComponent,
			},
			{
				path: 'classes',
				children: [
					{
						path: '',
						pathMatch: 'full',
						component: ClassesPageComponent,
					},
					{
						path: 'create',
						component: CreateClassPageComponent,
						canActivate: [CheckUserRoleGuard],
						data: { checkRole: [3, 2] },
					},
					{
						path: ':classId',
						component: ClassIndexPageComponent,
						children: [
							{
								path: '',
								pathMatch: 'full',
								redirectTo: 'home',
							},
							{
								path: 'home',
								component: ClassHomePageComponent,
							},
							{
								path: 'assigments',
								component: ClassAssigmentsPageComponent,
							},
							{
								path: 'final-grades',
								component: ClassFinalGradesPageComponent,
								canActivate: [CheckUserRoleGuard],
								data: { checkRole: [3, 2] },
							},
							{
								path: 'members',
								component: ClassMembersPageComponent,
							},
						],
					},
				],
			},
			{
				path: 'university-settings',
				component: UniversitySettingsIndexPageComponent,
				canActivate: [CheckUserRoleGuard],
				data: { checkRole: [3] },
				children: [
					{
						path: '',
						pathMatch: 'full',
						redirectTo: 'general',
					},
					{
						path: 'general',
						component: GeneralPageComponent,
					},
					{
						path: 'professors',
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: ProfessorsPageComponent,
							},
							{
								path: 'edit/:professorUserId',
								component: EditProfessorPageComponent,
							},
							{
								path: 'create',
								component: CreateProfessorPageComponent,
							},
						],
					},
					{
						path: 'admins',
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: AdminsPageComponent,
							},
							{
								path: 'edit/:adminUserId',
								component: EditAdminPageComponent,
							},
							{
								path: 'create',
								component: CreateAdminPageComponent,
							},
						],
					},
					{
						path: 'schools',
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: SchoolsPageComponent,
							},
							{
								path: 'create',
								component: CreateSchoolPageComponent,
							},
							{
								path: 'edit/:schoolId',
								component: EditSchoolPageComponent,
							},
						],
					},
					{
						path: 'programs',
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: ProgramsPageComponent,
							},
							{
								path: 'create',
								component: CreateProgramPageComponent,
							},
							{
								path: 'edit/:programId',
								component: EditProgramPageComponent,
							},
							{
								path: 'years/edit/:yearId',
								component: EditYearPageComponent,
							},
						],
					},
					{
						path: 'subjects',
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: SubjectsPageComponent,
							},
							{
								path: 'create',
								component: CreateSubjectPageComponent,
							},
							{
								path: 'edit/:subjectId',
								component: EditSubjectPageComponent,
							},
						],
					},
					{
						path: 'students',
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: StudentsPageComponent,
							},
							{
								path: 'edit/:studentUserId',
								component: EditStudentIndexPageComponent,
								children: [
									{
										path: '',
										pathMatch: 'full',
										redirectTo: 'platform-info',
									},
									{
										path: 'platform-info',
										component: PlatformInfoStudentPageComponent,
									},
									{
										path: 'scholar-situation',
										component: ScholarSituationStudentPageComponent,
									},
									{
										path: 'programs',
										component: ProgramsStudentPageComponent,
									},
								],
							},
							{
								path: 'create',
								component: CreateStudentPageComponent,
							},
						],
					},
					{
						path: 'new-study-year',
						component: NewStudyYearPageComponent,
					},
				],
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
