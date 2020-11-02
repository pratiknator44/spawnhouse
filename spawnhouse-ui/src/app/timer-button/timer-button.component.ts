import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'sh-timer-button',
  templateUrl: './timer-button.component.html',
  styleUrls: ['./timer-button.component.scss']
})
export class TimerButtonComponent implements OnInit {

  currentWidth = 0;
  isOn = false;
  @Input() text: String = 'Long Press';
  @Input() time: number = 2000;
  @Output() toggle = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit(): void {
    this.time = 2000/100;
    let interval = setInterval(() => {
      this.currentWidth = this.currentWidth+1;

      if(this.currentWidth === 100) {
        clearInterval(interval);
      }
    },this.time);
  }

  toggled() {
    this.isOn = !this.isOn;
    this.toggle.emit(this.isOn);
  }

}
