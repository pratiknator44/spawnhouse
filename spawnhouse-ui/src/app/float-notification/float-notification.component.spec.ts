import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatNotificationComponent } from './float-notification.component';

describe('FloatNotificationComponent', () => {
  let component: FloatNotificationComponent;
  let fixture: ComponentFixture<FloatNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
