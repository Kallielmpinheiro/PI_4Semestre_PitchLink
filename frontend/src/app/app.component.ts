import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {
  title = 'frontend';
  
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    initFlowbite();

    this.authService.checkAuth().subscribe(
      (response: any) => {
        this.isAuthenticated = response.authenticated;
      },
      (error) => {
        this.isAuthenticated = false;
      }
    );
  }
}
