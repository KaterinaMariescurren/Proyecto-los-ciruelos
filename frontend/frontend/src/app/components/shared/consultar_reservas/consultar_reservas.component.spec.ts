import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarReservasComponent } from './consultar_reservas.component';

describe('MisReservasComponent', () => {
  let component: ConsultarReservasComponent ;
  let fixture: ComponentFixture<ConsultarReservasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarReservasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
