import { Component, EventEmitter, Input, Output, output } from '@angular/core';
@Component({
  selector: 'app-alert-form',
  imports: [],
  templateUrl: './alert-form.component.html',
  styleUrl: './alert-form.component.css'
})

export class AlertFormComponent  {

  @Input() textAlert!: string ;

  showModal = false;

  @Output() showModalEmit = new EventEmitter( false );

  closeModal(){
    return this.showModalEmit.emit( !this.showModal) 
  }
}
