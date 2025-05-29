import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicasSegurancaComponent } from './dicas-seguranca.component';

describe('DicasSegurancaComponent', () => {
  let component: DicasSegurancaComponent;
  let fixture: ComponentFixture<DicasSegurancaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicasSegurancaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DicasSegurancaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
