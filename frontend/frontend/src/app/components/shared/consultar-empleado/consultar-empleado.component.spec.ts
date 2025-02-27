import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarEmpleadoComponent } from './consultar-empleado.component';

describe('ConsultarEmpleadoComponent', () => {
  let component: ConsultarEmpleadoComponent;
  let fixture: ComponentFixture<ConsultarEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarEmpleadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
