import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { SocketService } from 'src/assets/services/socker.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit {

  chats = [];
  dpLinks = [];
  selectedChat: string;
  conversation;
  user;
  otherUser;
  convoIndex = 0; // used to show dp of user on right
  messageFlags = { convosLoading: false, msgLoading: false};
  message: any;
  @ViewChild('messageArea') messageArea: ElementRef;

  constructor(private _notifService: FloatNotificationService,
              private _apiService: APIservice,
              private _http: HttpClient,
              private _storageService: StorageService,
              private _router: Router,
              private _navbarService: NavbarService,
              private _socketService: SocketService) { }

  ngOnInit(): void {
    this._notifService.setTitle('Messages');
    this.user = JSON.parse(this._storageService.getSessionData('user'));
    this.briefmessages();

    this._socketService.listen('test event').subscribe( data => {
      console.log("data from server: ", data);
    });
  }

  sendSocketMessage() {
    this._socketService.emit('test event', {message: "hello server"})
  }


  getAllMessages() {
    // this._apiService.getAllMessages();
  }

  briefmessages() {
    this.messageFlags.convosLoading = true;
    return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_BRIEF_MESSAGES).toPromise().then(result => {
      this.messageFlags.convosLoading = false;
      this.groupMessages(result['result']);
    });
  }

  groupMessages(messages) {
    // console.log("got messages", messages);
    const l = messages.length;
    this.dpLinks = [];
    this.chats = []

    if( l === 0) return;
    // seen is already sorted
    for(let x=0; x<l; x++) {
      this.chats.push({
        id: messages[x].id,
        userid: messages[x]['senderid'],
        username: this.getUserdataById(messages[x]['senderid'], 'username fname lname').then(res => {return (res['data']['username'] || res['data']['fname']+' '+res['data']['lname']);}),
        text: messages[x]['text'],
        time: messages[x]['time'],
        seen: messages[x]['seen'],
      });
      this.getUserImageById(messages[x]['senderid'], 'dp');
    }
    this.sortConvo();

    this.selectedChat = this.chats[0].id || null;
    this.messageFlags.convosLoading = false;
    this.getMessagesFromId(this.selectedChat);
    // this.user._id = this.chats[0].userid;
  }

  async getUserdataById(userid: string, fields?: string, index?: any) {
    console.log("user id ", userid);
    if(!userid) return;
    return await this._http.post(APIvars.APIdomain+"/"+APIvars.GET_USERDATA_BY_ID, {id: userid, fields}).toPromise();
  }

  getUserImageById(userid: string, type: string, index?: any) {
    if(!userid) return;
    const i = this.chats.findIndex( message => message.userid === userid);
    this.dpLinks[i] = this._apiService.getUserImageById('dp', userid);
  }

  // gets messages and sets all seen to true;
  getMessagesFromId(chatid) {
    this.conversation = [];
    this.messageFlags.msgLoading = true;
    this._apiService.getMessagesByChatid(chatid).toPromise().then( res => {
      this.conversation = res['result'];
      this.messageFlags.msgLoading = false
      if(res['result'].length ===0) {
        this.chats = [];
        return;
      }
      this.setOtherUserInfo();
      this.messageFlags.msgLoading = false;
      this.scrollDownMessages();
    });
    this._navbarService.refreshUnseenMessages.next(true);
  }

  setOtherUserInfo() {
    this.otherUser = this.chats[this.convoIndex];
    this.otherUser['nowplaying'] = null;
    this._http.get(APIvars.APIdomain+'/'+APIvars.NOW_PLAYING+'/'+this.otherUser.userid).toPromise().then(gamedata => {
      this.otherUser['nowplaying'] = gamedata['result'];
    });

    this._http.get(APIvars.APIdomain+'/'+APIvars.GAMEDATA+'/'+this.otherUser.userid).toPromise().then( gamedata => {
      this.otherUser['gamedata'] = gamedata['result'];
    });
  }

  routeToProfile() {
    console.log(this.otherUser);
    this._router.navigate(['/'+this.otherUser.userid]);
  }

  sendMessage() {
    if(this.message && this.message.trim() !== '') {
      // this._socketService.sensdMessage('test',{_cid: this.selectedChat, sender: this.user._id, text: this.message});
      this._http.post(APIvars.APIdomain+'/'+APIvars.SAVE_MESSAGE, {_cid: this.selectedChat, sender: this.user._id, text: this.message}).toPromise().then( response => {        
        this.conversation.push({
          sender: this.user._id,
          text: this.message,
          time: new Date().getTime(),
          seen: false,
        });
        
        this.chats[this.convoIndex].text = this.message.textl
        this.chats[this.convoIndex].time = new Date().getTime();
        this.chats[this.convoIndex].seen = false;
        const dpAddress = this.dpLinks[this.convoIndex];
        this.dpLinks.splice(this.convoIndex,1); 
        this.dpLinks.unshift(dpAddress);
        this.convoIndex = 0;
        this.sortConvo();

        this.message = null;
        this.scrollDownMessages();
      });
    }
  }

  scrollDownMessages() {
    console.log("scrolling ", this.messageArea.nativeElement.scrollHeight);
    this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
  }

  convoOptions( action) {
    const req = action === 'clear' ? APIvars.CLEAR_CONVO: APIvars.DELETE_CONVO;
    this._http.post(APIvars.APIdomain+'/'+req, {_cid: this.selectedChat}).subscribe( result => {
      if(result['message'] === 'passed') {
        this.briefmessages();
      }
    })
  }

  sortConvo() {
    this.chats.sort((m1, m2) => {
      return m1.time > m2.time ? -1 : 1;
    });
  }
}
