import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'sh-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent implements OnInit {
  @Input() status: boolean;
  @Input() disabled: boolean;
  @Input() labelLeft: string;
  @Output() statusChange = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit(): void {
  }

  statusChanged() {
    if(this.disabled) return;

    this.status = !this.status;
    this.statusChange.emit(this.status);
  }

}
