import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdbrPropostasComponent } from './sdbr-propostas.component';

describe('SdbrPropostasComponent', () => {
  let component: SdbrPropostasComponent;
  let fixture: ComponentFixture<SdbrPropostasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdbrPropostasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdbrPropostasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
