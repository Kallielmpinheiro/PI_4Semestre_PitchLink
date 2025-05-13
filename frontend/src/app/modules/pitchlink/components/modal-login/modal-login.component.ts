import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-modal-login',
  templateUrl: './modal-login.component.html',
  styleUrls: ['./modal-login.component.css']
})
export class ModalLoginComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) 
  {}

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  loginWithLinkedin(): void {
    this.authService.loginWithLinkedin();
  }

  ngOnInit(): void {

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const perfilParam = params.get('perfil');

    if (token) {
      localStorage.setItem('jwt_token', token);
      this.authService.setToken(token);
      
      window.history.replaceState({}, document.title, '/');
      
      if (perfilParam === "true") {
        setTimeout(() => {
          this.router.navigateByUrl('/perfil');
        }, 100);
      } else {
        setTimeout(() => {
          this.router.navigateByUrl('/app/recs');
        }, 100);
      }
    }
  }

}


