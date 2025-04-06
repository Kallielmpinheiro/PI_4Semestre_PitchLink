import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensagensPropostaComponent } from './mensagens-proposta.component';

describe('MensagensPropostaComponent', () => {
  let component: MensagensPropostaComponent;
  let fixture: ComponentFixture<MensagensPropostaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensagensPropostaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensagensPropostaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
