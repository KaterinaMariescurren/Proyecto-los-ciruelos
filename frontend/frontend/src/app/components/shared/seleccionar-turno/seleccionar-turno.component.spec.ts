import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarTurnoComponent } from './seleccionar-turno.component';

describe('SeleccionarTurnoComponent', () => {
  let component: SeleccionarTurnoComponent;
  let fixture: ComponentFixture<SeleccionarTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeleccionarTurnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionarTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
