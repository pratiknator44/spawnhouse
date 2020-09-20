import { Component } from '@angular/core';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'spawnhouse-ui';
  isNotifVisible: boolean;
  constructor(private _floatNoteService: FloatNotificationService)
  {
    _floatNoteService.closeOn.asObservable().subscribe( close => {
      this.isNotifVisible = close;
    });
  }
}
