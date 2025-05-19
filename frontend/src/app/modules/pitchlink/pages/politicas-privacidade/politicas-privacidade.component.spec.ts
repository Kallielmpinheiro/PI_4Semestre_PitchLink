import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticasPrivacidadeComponent } from './politicas-privacidade.component';

describe('PoliticasPrivacidadeComponent', () => {
  let component: PoliticasPrivacidadeComponent;
  let fixture: ComponentFixture<PoliticasPrivacidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticasPrivacidadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticasPrivacidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
