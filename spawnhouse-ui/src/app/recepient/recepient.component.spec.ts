import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepientComponent } from './recepient.component';

describe('RecepientComponent', () => {
  let component: RecepientComponent;
  let fixture: ComponentFixture<RecepientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
