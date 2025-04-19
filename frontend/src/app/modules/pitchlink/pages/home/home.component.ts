import { Component, OnInit } from '@angular/core';

import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { MainComponent } from '../../components/main/main.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    MainComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {

  // caso nao tenha um jwt valido vai para raiz  , caso tenha fica em app/recs. mas pq? pq sim. fé

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.checkAuth()) {
      this.router.navigate(['/app/recs']);
    }
  }

}
