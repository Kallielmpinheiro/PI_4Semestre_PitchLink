import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';
import { api, socialAccounts } from '../../../providers';
import { catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private baseUrl = environment.getBaseUrl();

  constructor(private http: HttpClient, private router: Router) {}

  loginWithGoogle() {
    window.location.href = `${this.baseUrl}${socialAccounts.google}`;
  }
  
  loginWithLinkedin() {
    window.location.href = `${this.baseUrl}${socialAccounts.linkedin}`;
  }

  checkAuth() {
    return this.http.get(`${this.baseUrl}${api.check}`, { withCredentials: true })
    .pipe(map(() => true),
    catchError(() => of(false)));
  }

  logout() {
    return this.http.post(`${this.baseUrl}${socialAccounts.logout}`, { withCredentials: true }).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  ListService(){
    return this.http.get(`${this.baseUrl}${api.list}`, { withCredentials: true });
  }

  //  TODO : Arrumar os nomes

  DTO(){
    return this.http.get(`${this.baseUrl}${api.DTO}`, {withCredentials: true});
  }

  saveFullProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${api.save}`, profileData, { 
      withCredentials: true 
    }).pipe(
      catchError(error => {
        console.error(error);
        return throwError(() => error);
      })
    );
  }
}