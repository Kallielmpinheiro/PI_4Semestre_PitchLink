import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-alert-form',
  imports: [],
  templateUrl: './alert-form.component.html',
  styleUrl: './alert-form.component.css'
})


export class AlertFormComponent  {

  @Input() textAlert!: string ;

 
}
