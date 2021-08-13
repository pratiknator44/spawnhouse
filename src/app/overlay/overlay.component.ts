import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OverlayService } from 'src/assets/services/overlay.service';

@Component({
  selector: 'sh-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {

  // @Output() overlayClicked = new EventEmitter<MouseEvent>();
  @Input() closeOnClick: boolean;
  @Input() transparent: boolean = true;
  @Output() clicked = new EventEmitter<MouseEvent>();
  constructor( private _overlayService: OverlayService) {}

  ngOnInit(): void {
    this._overlayService.configSubject.asObservable().subscribe( config => {
      this.closeOnClick = config.closeOnClick;
      this.transparent = config.transparent;
    });
  }

  overlayClicked(event: MouseEvent) {
    this.clicked.emit(event);
    this._overlayService.clickedSubject.next(event);
  }

}
