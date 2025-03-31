import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, of, map } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const authGuardNotFoundGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificando se o usuário está autenticado de forma assíncrona
  return authService.checkAuth().pipe(
    catchError(() => of(false)), // Retorna 'false' em caso de erro
    map((response) => { // Definindo o tipo explicitamente
      if (response.status === 404) {
        return true;
      } else {
        router.navigate([''], { replaceUrl: true });
        return false;
      }
    })
  );
};
