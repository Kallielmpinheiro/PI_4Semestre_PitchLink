import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaIdeiasComponent } from './lista-ideias.component';

describe('ListaIdeiasComponent', () => {
  let component: ListaIdeiasComponent;
  let fixture: ComponentFixture<ListaIdeiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaIdeiasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaIdeiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
