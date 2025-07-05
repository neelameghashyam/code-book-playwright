import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatComponentsComponent } from './mat-components.component';

describe('MatComponentsComponent', () => {
  let component: MatComponentsComponent;
  let fixture: ComponentFixture<MatComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatComponentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
