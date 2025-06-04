import { Component, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-termos-condicoes',
  imports: [HeaderComponent, ModalLoginComponent, FooterComponent],
  templateUrl: './termos-condicoes.component.html',
  styleUrl: './termos-condicoes.component.css'
})
export class TermosCondicoesComponent {
  hide = signal(true);

  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.route.data.subscribe(data => {
      this.hide.set(data['hide']);
    });
  }
}
