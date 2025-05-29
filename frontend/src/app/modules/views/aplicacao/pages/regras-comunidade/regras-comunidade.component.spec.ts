import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegrasComunidadeComponent } from './regras-comunidade.component';

describe('RegrasComunidadeComponent', () => {
  let component: RegrasComunidadeComponent;
  let fixture: ComponentFixture<RegrasComunidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegrasComunidadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegrasComunidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
