import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { SocketService } from 'src/assets/services/socket.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit {

  chats = [];
  // dpLinks = [];
  selectedChat: string;
  conversation;
  user;
  otherUser;
  convoIndex = 0; // used to show dp of user on right
  messageFlags = { convosLoading: true, msgLoading: false, userdataLoading: false, sendingMessage: false};
  message: any;
  unseenConvos = [];
  animate: boolean;
  isMobile: boolean = false;
  quickChats = ['Roger that!', 'To the lobby!', 'Lock & load', 'server password please?', 'Noob!'];
  lastActive;
  @ViewChild('messageTextbox') messageElement: ElementRef;
  @ViewChild('messageArea') messageArea: ElementRef;

  constructor(private _notifService: FloatNotificationService,
              private _apiService: APIservice,
              private _http: HttpClient,
              private _storageService: StorageService,
              private _router: Router,
              private _navbarService: NavbarService,
              private _socketService: SocketService) { }

  ngOnInit(): void {

    this.isMobile = window.innerHeight > window.innerWidth;

    this._notifService.setTitle('Messages');
    this.user = this._storageService.currentUser;

    this._socketService.getData('new-message').subscribe( data => {
      // console.log("message = ", data);
      this.addToConversation(data);

      setTimeout(() => this.scrollDownMessages(), 500);
    });

    this.unseenConvos = this._navbarService.unseenMessagesRecord;
    this.briefmessages();
    this.user['dp'] = this._apiService.getUserImageById('dp', this.user._id);
  }

  addToConversation(messageOb) {
    if(this.selectedChat == messageOb._cid) {

      const msg = {
        text: messageOb.text,
        sender: messageOb.sender,
        time: messageOb.time,
        seen: false
      };
      this.conversation.push(messageOb);
    }
  }

  getAllMessages() {}

  briefmessages() {
    this.messageFlags.convosLoading = true;
    return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_BRIEF_MESSAGES).toPromise().then(result => {
      this.messageFlags.convosLoading = false;
      // console.log("brief messages = ", result);
      this.groupMessages(result['result']);
    });
  }

  groupMessages(convos) {
    // console.log("got messages", messages);
    const l = convos.length;
    // this.dpLinks = [];
    this.chats = []

    if( l === 0) return;
    // seen is already sorted
    for(let x=0; x<l; x++) {
      this.chats.push({
        id: convos[x].id,
        userid: convos[x]['senderid'],
        username: this.getUserdataById(convos[x]['senderid'], 'username fname lname').then(res => {return (res['result']['username'] || res['result']['fname']+' '+res['result']['lname']);}),
        text: convos[x]['text'],
        time: convos[x]['time'],
        seen: convos[x]['seen'],
        otherUser: convos[x]['senderid'],
        lastSender: convos[x].lastSender,
        dpLink: this._apiService.getUserImageById('dp', convos[x]['senderid'])
      });
      // this.getUserImageById(messages[x]['senderid'], 'dp');
    }
    this.sortConvo();
    // this.selectedChat = this._navbarService.selectedConvo ||  this.chats[0].id || null;
    this.getMessagesFromId(this._navbarService.selectedConvo ||  this.chats[0].id || null);

    if(this.selectedChat) this.convoIndex = this.chats.findIndex( convo => convo.id == this.selectedChat);
    this._navbarService.selectedConvo = null;
    this.messageFlags.convosLoading = false;
    this.getMessagesFromId(this.selectedChat);
    // this.user._id = this.chats[0].userid;
  }

  async getUserdataById(userid: string, fields?: string, index?: any) {
    if(!userid) return;
    return await this._http.post(APIvars.APIdomain+"/"+APIvars.GET_USERDATA_BY_ID, {id: userid, fields}).toPromise();
  }

  // gets messages and sets all seen to true;
  getMessagesFromId(chatid) {
    if(this.selectedChat === chatid)  return;
    this.selectedChat = chatid
    this.conversation = [];
    this.messageFlags.msgLoading = true;
    this.messageFlags.userdataLoading = true;
    
    this.lastActive = 'getting online status...';
    this._apiService.getMessagesByChatid(chatid).then( res => {
      this.conversation = res['result'];
      this.messageFlags.msgLoading = false
      if(res['result'].length ===0) {
        this.chats = [];
        return;
      }
      // this.setOtherUserInfo();
      this.otherUser = this.chats[this.convoIndex];

      this._apiService.getLastActive(this.otherUser.userid).then( res => {
        this.lastActive = res['data'];
      }).catch(() => {
        this.lastActive = 'status unknown';
      }); 

      this.messageFlags.msgLoading = false;

      setTimeout(() => {    // rendering takes time, so delay the scrolldown impact
        this.scrollDownMessages();
      }, 1000);
    });
    this._navbarService.refreshUnseenMessages.next(true);
  }

  setOtherUserInfo() {
    this.messageFlags.userdataLoading = true;
    this.otherUser = this.chats[this.convoIndex];
    this.messageFlags.userdataLoading = false;
    this.otherUser['nowplaying'] = this.otherUser['gamedata'  ] = this.otherUser['playerType'] = null;
    this._http.get(APIvars.APIdomain+'/'+APIvars.NOW_PLAYING+'/'+this.otherUser.userid).toPromise().then(gamedata => {
      this.otherUser['nowplaying'] = gamedata['result'];
      this._http.get(APIvars.APIdomain+'/'+APIvars.GAMEDATA+'/'+this.otherUser.userid).toPromise().then( gamedata => {
        console.log("gamedata ", gamedata['result']);
        this.otherUser['gamedata'] = gamedata['result'];
        this.otherUser['playerType'] = gamedata['result'] ? gamedata['result']['playerType'] : null;
        
        this.messageFlags.userdataLoading = false;
      });
    });
  }

  routeToProfile() {
    this._router.navigate(['/'+this.otherUser.userid]);
  }

  sendMessage() {
    if(this.messageFlags.msgLoading || this.messageFlags.sendingMessage) return;
    this.messageFlags.sendingMessage = true;
    if(this.message && this.message.trim() !== '') {
      const sendObject = {_cid: this.selectedChat, sender: this.user._id, text: this.message, time: new Date().getTime(), otheruserid: this.chats[this.convoIndex].otherUser};
      this._socketService.pushData("new-message", sendObject);

      this._http.post(APIvars.APIdomain+'/'+APIvars.SAVE_MESSAGE, sendObject).toPromise().then( response => {        
        this.conversation.push({
          sender: this.user._id,
          text: this.message,
          time: new Date().getTime(),
          seen: false,
        });
        this.messageFlags.sendingMessage = false;
        this.chats[this.convoIndex].text = this.message.text;
        this.chats[this.convoIndex].time = new Date().getTime();
        this.chats[this.convoIndex].seen = false;
        this.convoIndex = 0;
        this.sortConvo();
        this.message = '';
      setTimeout(()=> {
        this.scrollDownMessages();
        this.messageElement.nativeElement.focus();
      }, 500)
      });
    }
  }

  sendQuickChat(index) {
    this.message = this.quickChats[index];
    this.sendMessage();
  }

  scrollDownMessages() {
    // console.log("scrollHeight ", this.messageArea.nativeElement.scrollHeight);
    this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight+175;
    // console.log("scrollTop ", this.messageArea.nativeElement.scrollTop);

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

  keyPressedInMessageBox(event: KeyboardEvent) {
    if(event.key === 'Enter') {
      this.sendMessage();
    }
    return;
  }
}
