import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' } // Redirect unknown routes to the main page
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
