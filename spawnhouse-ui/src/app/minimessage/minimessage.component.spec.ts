import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimessageComponent } from './minimessage.component';

describe('MinimessageComponent', () => {
  let component: MinimessageComponent;
  let fixture: ComponentFixture<MinimessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinimessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinimessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
