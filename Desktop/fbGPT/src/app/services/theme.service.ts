import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme = new BehaviorSubject<string>(localStorage.getItem('theme') || 'light');
  theme$ = this.theme.asObservable();
  themeSubject: any;

  constructor() {
    this.applyTheme(this.theme.value);
  }


  toggleTheme() {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.themeSubject.next(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  }

  private applyTheme(theme: string) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }
}
