import { Component, OnInit } from '@angular/core';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { OverlayService } from 'src/assets/services/overlay.service';

@Component({
  selector: 'pc-view',
  templateUrl: './pc-view.component.html',
  styleUrls: ['./pc-view.component.scss']
})
export class PcViewComponent {
  
  title = 'spawnhouse-ui';
  isNotifVisible: boolean;
  config: {closeOnClick: boolean, transparent: boolean} = {closeOnClick: false, transparent: false};
  showOverlay: boolean;
  constructor(private _floatNoteService: FloatNotificationService, private _overlayService: OverlayService)
  {}

  ngAfterViewInit() {
    this._floatNoteService.closeOn.asObservable().subscribe( close => {
      this.isNotifVisible = close;
    });

    this._overlayService.configSubject.asObservable().subscribe( config => {
      this.config = config;
      this.showOverlay = true;
    });

    this._overlayService.closeSubject.asObservable().subscribe( close => {
      this.showOverlay = false;
    })
  }

  overlayClicked(event) {
    this.showOverlay = !this.config.closeOnClick
    this._overlayService.closeSubject.next();
  }

}
