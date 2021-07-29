import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { DurationsEnum } from 'src/assets/variables/toasts.enum';

@Component({
  selector: 'sh-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  showing: boolean;
  toasts = [];
  @ViewChild('feedbackTemplate') feedbackTemplate: TemplateRef<any>;
  constructor(private _router: Router,
    private _notifService: FloatNotificationService,
    private _cookieService: CookieService) { }

  ngOnInit(): void {
    // this.setToasts();

    this._notifService.showToasts.asObservable().subscribe( status => {
      this.showing = status;
    });

    this._notifService.makeToast.asObservable().subscribe( toast => {
      if(toast === 'feedback') {
        this.addFeedbackToast();
        return;
      }
      this.make(toast);
      this.showing = true;
    });
  }

  // test function
  // setToasts() {
    // this.addFeedbackToast();
    // this.make({heading:'comment', text:'Someone commented on your post'});
    // this.make({heading:'error', text:'something went wrong'});
    // this.make({heading:'like', text:'Someone liked on your post'});
    // this.make({heading:'comment', text:'Someone commented on your post'});
    // this.make({heading:'follow', text: '<strong>accesspragya</strong> started following you'});
  // }

  async make(toastOb) {
    let toast;
    const heading = toastOb.heading;
    const time = await setTimeout(() => {return new Date().getTime();});    // to avoid having same timestamp of >1 toasts
    if(heading === 'like') {
      toast = {heading, type: 'danger', icon: 'iconset2 icon-heart', text: toastOb.text, duration: DurationsEnum.SHORT, time}
    } else if (heading === 'comment') {
      toast = {heading, type: 'success', icon: 'iconset icon-bubbles3', text: toastOb.text, duration: DurationsEnum.MEDIUM, time}
    } else if(heading === 'important') {
      toast = {heading, type: 'theme', icon: 'iconset icon-info', text: toastOb.text, duration: null, time}
    } else if(heading === 'follow') {
      toast = {heading, type: 'info', icon: 'iconset icon-user', text: toastOb.text, duration: DurationsEnum.LONG, time}
    } else if(heading === 'error') {
      toast = {heading, type: 'danger', icon: 'iconset2 icon-cross', text: toastOb.text, duration: DurationsEnum.VERY_LONG, time}
    } else if(heading === 'required') {
      toast = {heading, type: 'danger', icon: 'iconset2 icon-cross', text: toastOb.text, duration: DurationsEnum.VERY_LONG, time}
    } else if(heading === 'feedback') {
      toast = {heading, type: 'theme', icon: '', text: toastOb.text, duration: null, time}
    } else {
      toast = {heading, type: toastOb.type, icon: toastOb.icon, text: toastOb.text, duration: toastOb.duration, time};
    }

    this.toasts.push(toast);
    this.toasts.sort( (t1, t2) => t1.time > t2.time ? 1 : -1);
    this.showing = true;
    // start timer to auto-remove the notification toast
    if(toast.duration) {
      setTimeout( () => {
        this.removeToastViaTime(toast.time);
      }, toast.duration * 1000);
    }
  }

  addFeedbackToast() {
    /* if user has not given feedback or rejected the feedback option or 'Hide', ask him every 24 hours
     * if use has given feedback, ask him every 24 hours
    */
   const lastFeedbackTime = parseInt(this._cookieService.get('feedbackTime'));
    if(lastFeedbackTime) {
      if( new Date().getTime() - lastFeedbackTime > 86400000) {     // ms in 24h
        this.make({heading:'feedback', text:this.feedbackTemplate});
        this._cookieService.set('feedbackTime', (new Date().getTime())+'');
      }
    } else {
      this.make({heading:'feedback', text:this.feedbackTemplate});
      this._cookieService.set('feedbackTime', (new Date().getTime())+'');
    }
  }

  removeToastViaTime(time) {
    const i = this.toasts.findIndex( e => e.time === time);
    this.toasts.splice(i, 1);
    if(this.toasts.length === 0)  this.showing = false;
  }

  removeToast(i) {
    this.toasts.splice(i, 1);
    if(this.toasts.length === 0)  this.showing = false;
  }

  routeTo(url) {
    this._router.navigate(['/'+url]);
  }

}
