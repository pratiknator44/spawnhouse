import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { OverlayService } from 'src/assets/services/overlay.service';

@Component({
  selector: 'sh-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  @Input() title: string | number;
  @Input() template: any;
  @Output() close;
  @Output() positive;
  @Output() negative;
  constructor(private _overlayService: OverlayService) { }

  ngOnInit(): void {
    this.close = new EventEmitter();
    this.positive = new EventEmitter();
    this.negative = new EventEmitter();
  }

}
