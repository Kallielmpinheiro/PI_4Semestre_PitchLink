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
    return this.http.get(`${this.baseUrl}${api.check}`, { withCredentials: true }).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response;
        }
        return false;
      }),
      catchError((error) => {
        return of(error);
      })
    );
  }

  logout() {
    return this.http.get(`${this.baseUrl}${api.logout}`, { withCredentials: true });
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