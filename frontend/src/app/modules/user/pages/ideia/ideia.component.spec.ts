import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeiaComponent } from './ideia.component';

describe('IdeiaComponent', () => {
  let component: IdeiaComponent;
  let fixture: ComponentFixture<IdeiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
