import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegurancaPoliticaComponent } from './seguranca-politica.component';

describe('SegurancaPoliticaComponent', () => {
  let component: SegurancaPoliticaComponent;
  let fixture: ComponentFixture<SegurancaPoliticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegurancaPoliticaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegurancaPoliticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
