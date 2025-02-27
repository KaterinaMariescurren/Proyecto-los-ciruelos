import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasDuenioComponent } from './reservas-duenio.component';

describe('ReservasDuenioComponent', () => {
  let component: ReservasDuenioComponent;
  let fixture: ComponentFixture<ReservasDuenioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservasDuenioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasDuenioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
