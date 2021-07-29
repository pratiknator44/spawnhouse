import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { APIservice } from 'src/assets/services/api.service';
import { NowplayingService } from 'src/assets/services/now-playing.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { SocketService } from 'src/assets/services/socket.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-now-playing',
  templateUrl: './now-playing.component.html',
  styleUrls: ['./now-playing.component.scss']
})
export class NowPlayingComponent implements OnInit {

  @Input() userid;
  @Input() npdata;
  @Output() onRemove = new EventEmitter();
  @Output() onNew  = new EventEmitter();

  npFlags = {shownppwd: false, disableGetNppwdOption: false, isLive: false, showPendingReq: false};
  nppwd: String; // password for now playing: if set
  nppwdRequestText: String = 'Send a request to join room';
  isUserProfile = true;
  playersJoined: any = '-'
  pendingRequests: any = [];
  
  constructor(private _socketService: SocketService,
    private _nowplayingService: NowplayingService,
    private _storageService: StorageService,
    private _overlayService: OverlayService,
    private _apiService: APIservice) { }

  ngOnInit(): void {
    this.isUserProfile = this.userid === this._storageService.currentUser._id;
    // get no of players who joined np
    // add conditions:
    if(this.isUserProfile)
    {
      this._nowplayingService.playersNpData = this.npdata;
    try {
      this.playersJoined = JSON.parse(this._storageService.getSessionData('accessorIds')).length;
    } catch (e) {
      this.playersJoined = '-';
    }}
    // this._nowplayingService.getPlayersJoined(this.userid);
    this.nppwd = this._storageService.getSessionData('nppwd');

    // check if sending pswd or error;
    this._nowplayingService.startGetNpPlayerJoinedListener();

    if(this.isUserProfile) {
      this._nowplayingService.newPwdRequestSubject.asObservable().subscribe(noOfAskers => {
        // console.log("new requester ", noOfAskers);
        this.playersJoined = noOfAskers;
      });

      this._nowplayingService.pendingRequestUpdated.asObservable().subscribe(pr => {
        this.pendingRequests = pr;
      })
    }

    /* isLive conditions:
     1. player est. time - player updated now playing > 0 
    */
    this.isPlayerLive();
  }

  doOnRemove() {
    this.onRemove.emit();
  }

  doOnNew() {
    this.onNew.emit();
    this._apiService.router.navigate(['./create']);
  }

  sendRequestForNppwd() {
    if(this.npFlags.disableGetNppwdOption) return;

    this._socketService.pushData('request-np-pwd', {senderid: this._storageService.currentUser._id, receiverid: this.userid});
    //take(1) responds to 1 value and unsubscribes itself
    this._nowplayingService.getPwdResponseListener().subscribe(data => {
      if('pswd' in data) {
        this.nppwdRequestText = 'passcode: '+ data['pswd'];
        this.npFlags.disableGetNppwdOption = true;
        clearTimeout(timeout);
      } else if('error in data') {
        this.nppwdRequestText = 'oh damn! '+ data['error'];
      }
    });
    this.nppwdRequestText = 'Waiting for response from owner...';
    const timeout = setTimeout(() => {
      this.nppwdRequestText = 'No response from owner, try texting :('
    }, 60000);
  }

  // visible for 2 mins.
  startShowNppwdTimeout() {
    if(this.nppwd === ':o:')  return;
    this._storageService.getSessionData('nppwd')
    this.npFlags.shownppwd = true;
    
    // autohide in 2 mins
    setTimeout(() => {
      this.npFlags.shownppwd = false;
    }, 120000);
  }

  isPlayerLive() {
    // check if player is online
    // console.log("nowplay data = ", this.npdata);
    // current time - last update <= est. time of play.
    if(this.npdata['estplaytime'] && this.npdata['estplaytime'] !== 0)
      {
        // console.log("estplaytime = ", (3600000 * this.npdata['estplaytime']), " ", (new Date().getTime() - this.npdata['time']));
        this.npFlags.isLive = 3600000 * this.npdata['estplaytime'] > new Date().getTime() - this.npdata['time'];
      }
    else 
      this.npFlags.isLive = true;
  }

  // this function is disabled right now
  showPendingRequests() {
    this.npFlags.showPendingReq = true;
    this._overlayService.closeSubject.next({closeOnClick: false, transparent: false});
    this._overlayService.showSubject.next(true);
  }

  closeOverlay() {
    this._overlayService.showSubject.next(false);
  }

}
