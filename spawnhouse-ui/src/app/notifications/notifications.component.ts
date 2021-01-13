import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
;
import { APIservice } from 'src/assets/services/api.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements AfterViewInit, OnChanges {

  @Input() notifications;
  @Output() close = new EventEmitter;
  constructor( private _apiService: APIservice,
    private _router: Router ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.notifications = changes['notifications']['currentValue'];
    this.getUserdata();
  }

  ngAfterViewInit(): void {
    this.getUserdata();
  }

  getUserdata() {
    const l = this.notifications.length;
    console.log("notifs len = ", this.notifications.length);
    for(let x = 0; x < l; x++) {
      this.getUserImageById(this.notifications[x].userid, x);
      this._apiService.getUserdataById(this.notifications[x].userid, 'fname username'+(this.notifications[x]['type'] == 3 ? ' nowplaying' : '')).then( userdata => {
        Object.assign(this.notifications[x], userdata['data']); // concat object properties
      });
    }
  }


  getUserImageById(userid: string, index?: any) {
    if(!userid) return;
    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+userid, { responseType: 'blob' }).subscribe( image => {
      if(image['type'] === 'application/json')  {
        // this.dpLinks[index] = null;
        return;
      }

      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.notifications[index]['dp'] = this._apiService.dom.bypassSecurityTrustUrl(reader.result.toString());        
      }, false);
      if (image) {
         reader.readAsDataURL(image as Blob);
      }
    });
  }

  onNotificationClick(notificationType, userid) {
    if(notificationType == 2) {
      this.close.emit();
      this._router.navigate(['/'+userid]);
    }
  }

}
