import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediatextComponent } from './mediatext.component';

describe('MediatextComponent', () => {
  let component: MediatextComponent;
  let fixture: ComponentFixture<MediatextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediatextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediatextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
