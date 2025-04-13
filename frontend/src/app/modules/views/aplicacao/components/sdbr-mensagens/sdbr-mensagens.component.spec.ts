import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdbrMensagensComponent } from './sdbr-mensagens.component';

describe('SdbrMensagensComponent', () => {
  let component: SdbrMensagensComponent;
  let fixture: ComponentFixture<SdbrMensagensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdbrMensagensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdbrMensagensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
