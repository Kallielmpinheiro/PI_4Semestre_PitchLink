import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupPropostasComponent } from './setup-propostas.component';

describe('SetupPropostasComponent', () => {
  let component: SetupPropostasComponent;
  let fixture: ComponentFixture<SetupPropostasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupPropostasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupPropostasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
