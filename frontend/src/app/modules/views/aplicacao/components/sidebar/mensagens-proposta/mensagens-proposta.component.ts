import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-mensagens-proposta',
  imports: [],
  templateUrl: './mensagens-proposta.component.html',
  styleUrl: './mensagens-proposta.component.css'
})
export class MensagensPropostaComponent {
  ngOnInit(): void {
    initFlowbite();
  }
}
