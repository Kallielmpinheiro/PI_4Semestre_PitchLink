import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SdbrPropostasComponent } from '../../sdbr-propostas/sdbr-propostas.component';
import { SdbrMensagensComponent } from '../../sdbr-mensagens/sdbr-mensagens.component';

@Component({
  selector: 'app-mensagens-proposta',
  imports: [
    SdbrPropostasComponent,
    SdbrMensagensComponent
  ],
  templateUrl: './mensagens-proposta.component.html',
  styleUrl: './mensagens-proposta.component.css'
})
export class MensagensPropostaComponent {
  ngOnInit(): void {
    initFlowbite();
  }
}
