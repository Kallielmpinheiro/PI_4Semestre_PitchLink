import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdbrSolicitacoesComponent } from './sdbr-solicitacoes.component';

describe('SdbrSolicitacoesComponent', () => {
  let component: SdbrSolicitacoesComponent;
  let fixture: ComponentFixture<SdbrSolicitacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdbrSolicitacoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdbrSolicitacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
