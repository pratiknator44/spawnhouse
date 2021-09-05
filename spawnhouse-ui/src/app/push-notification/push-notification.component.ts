import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ConsoleIconPipe } from 'src/assets/pipes/gamegenre.pipe';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { PushNotificationsService } from 'src/assets/services/push-notifications.service';
import { APIvars, ServiceKeysEnum } from 'src/assets/variables/api-vars.enum';
import { DurationsEnum } from 'src/assets/variables/toasts.enum';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss']
})
export class PushNotificationComponent implements OnInit {

  domain = APIvars.APIdomain;
  // existsStatus: boolean;
  constructor(private _swPush: SwPush,
    private _pushSubscription: PushNotificationsService,
    private _floatNotificationService: FloatNotificationService,
    private _apiService: APIservice) { }

  ngOnInit(): void {
    this._floatNotificationService.setTitle('Notification Subscription');
    this.getStatus();
  }

  async subsribeToBrowserNotifications() {
    console.log("subscription ", Notification.permission);

    if (Notification.permission === 'default') {
      this._pushSubscription.askForPermission();
    }
    else if(Notification.permission === 'denied') {
      this._floatNotificationService.makeToast.next({header: "Information", type: "info", text: "You have Blocked notification from this website"});
      return;
    }
    console.log("requesting subscription...")
    this._swPush.requestSubscription({
      serverPublicKey: "123"
      //ServiceKeysEnum.PUSH_SUBSCRIPTION_PUBLIC_KEY
    }).then(sub => {
      console.log("passed subscription...")
      this._pushSubscription.addPushSubscriber(JSON.stringify(sub)).subscribe(success => {
        this._floatNotificationService.makeToast.next({heading: "Success", text: "We'll notify you when something happens", type: "success", duration: DurationsEnum.MEDIUM});
      })
    }).catch( e => {
      console.log("sub failed...")
      this._floatNotificationService.makeToast.next({heading: "Failed to all subscribtion", text: e, type: 'danger', duration: DurationsEnum.MEDIUM });
    }).finally( function() {
        console.log("inside finally");
    });
    console.log("function ends");
  }

  triggerNotification() {
    this._pushSubscription.getSampleData().toPromise().then(result => result).catch(e => {
      console.log("error subscription ", e);
    });
  }

  getStatus() { }
  //   this._apiService.getNotificationSubscriptionStatus().then( result => {
  //     if('status' in result) {
  //       this.existsStatus = result['status'];
  //     }
  //   }).catch( error => {
  //     this._floatNotificationService.makeToast.next({heading: 'Server error', text: 'Something went wrong '+error['error'], type: 'danger'});
  //   });
  // }

  unsubscribe() {
    this._apiService.unsubsribePushNotifications().then( res => {
      this._floatNotificationService.makeToast.next({heading: "Success", text: "No notifications will be send to any of your devices", type: "success", duration: DurationsEnum.SHORT});
    }).catch( e=> {
      this._floatNotificationService.makeToast.next({heading: "Failed to Unsubscribe", text: e['error'], type: "danger"});
    })
  }

  sample() {
    console.log("asking ofr sample notification request");
    this._apiService.samplePushNotification().then( result => {
      console.log("got sample result ", result);
    }).catch( error => {
      console.log("error aya ", error);
    })
  }
}
