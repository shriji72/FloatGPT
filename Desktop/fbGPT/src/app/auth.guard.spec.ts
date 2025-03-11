import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerMock = { navigate: jasmine.createSpy('navigate') }; // Mock Router

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerMock }, // Provide a mock Router
      ],
    });

    guard = TestBed.inject(AuthGuard); // Properly inject the guard
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true for authenticated users', () => {
    spyOn(localStorage, 'getItem').and.returnValue('true'); // Simulate logged-in user
    expect(guard.canActivate()).toBeTrue();
  });

  it('should navigate to login for unauthenticated users', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null); // Simulate no user
    expect(guard.canActivate()).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
