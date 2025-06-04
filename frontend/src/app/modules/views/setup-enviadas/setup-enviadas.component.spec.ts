import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupEnviadasComponent } from './setup-enviadas.component';

describe('SetupEnviadasComponent', () => {
  let component: SetupEnviadasComponent;
  let fixture: ComponentFixture<SetupEnviadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupEnviadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupEnviadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
