import { Component } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { APIvars } from 'dist/assets/variables/api-vars.enum';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { ServiceKeysEnum } from 'src/assets/variables/api-vars.enum';
import { DurationsEnum } from 'src/assets/variables/toasts.enum';

@Component({
  selector: 'app-push-notifications',
  templateUrl: './push-notifications.component.html',
  styleUrls: ['./push-notifications.component.scss']
})
export class PushNotificationsComponent {

  buttonText = {sub: 'Subscribe', unsub: 'Unsubscribe from all notifications'};
  domain = APIvars.APIdomain;

  constructor(private _floatNotifications: FloatNotificationService,
    private readonly _swPush: SwPush,
    private _apiService: APIservice) { }

  getSubscription() {
    console.log(Notification.permission);
    if(Notification.permission === 'default') {
      Notification.requestPermission().then(() => {
        this.requestSubscription();
      }).catch(() => {
        this._floatNotifications.makeToast.next({heading: "Not found", type: "danger", text: "Seems location is not supported on this device", duration: DurationsEnum.MEDIUM});
      });
    }
    else if(Notification.permission === 'denied') {
      this._floatNotifications.makeToast.next({heading: "Permission required", type: "info", text: "Notification permission is required to use this feature", duration: DurationsEnum.MEDIUM});
    } else {
      this.requestSubscription();
    }
  }

  async requestSubscription() {
    try { 
      const sub = await this._swPush.requestSubscription({ serverPublicKey: ServiceKeysEnum.PUSH_SUBSCRIPTION_PUBLIC_KEY });
      console.log("subscription object ", sub);
      
      this.saveSubscriptionObject(sub);

    } catch  (e) {
      this._floatNotifications.makeToast.next({header: "Task failed", text: "failed to get subscription object"+e, duration: DurationsEnum.LONG, type: "danger"});
    }
  }

  saveSubscriptionObject(sub) {

    if(this.buttonText.sub.startsWith('P')) return;

    this.buttonText.sub = 'Please wait...';

    this._apiService.savePushSubscriptionObject(sub).then(result => {
      this._floatNotifications.makeToast.next({heading: 'Success', text: 'Subscription saved', duration: DurationsEnum.SHORT, type: 'success'});
      this.buttonText.sub = 'Subscribed for this device';
    }).catch( e => {
      this._floatNotifications.makeToast.next({heading: 'Failed', text: 'Subscription failed '+JSON.stringify(e), duration: DurationsEnum.SHORT, type: 'danger'});
      this.buttonText.sub = 'Subscribe';
    });
  }

  getSampleNotification() {
    this._apiService.samplePushNotification();
  }

  unsubscribeAll() {

    if(this.buttonText.unsub.endsWith('P')) return;
    
    this.buttonText.unsub = 'Please wait...';
    this._apiService.unsubsribePushNotifications().then( result => {
      this._floatNotifications.makeToast.next({heading: "Success", text: "All your subscriptions have been removed", type: 'success', duration: DurationsEnum.SHORT});
      this.buttonText.unsub = 'No subscription taken';
    }).catch( e => {
      this._floatNotifications.makeToast.next({heading: "Failed", text: e, type: 'danger', duration: DurationsEnum.SHORT});
      this.buttonText.unsub = 'Unsubscribe';
    });
  }

}
