import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { GameGenrePipe } from 'src/assets/pipes/gamegenre.pipe';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NowplayingService } from 'src/assets/services/now-playing.service';
import { SocketService } from 'src/assets/services/socket.service';
import { StorageService } from 'src/assets/services/storage.service';
import { SuggestionsComponent } from '../suggestions/suggestions.component';

@Component({
  selector: 'sh-nowplaying-form',
  templateUrl: './nowplayingform.component.html',
  styleUrls: ['./nowplayingform.component.scss']
})
export class NowplayingFormComponent implements OnInit {

  nowplayingForm;
  selectedConsole;
  showConsoleList;
  gameImage;
  searchedGame;
  gameSuggestions = [];
  searchword;
  npflags = { lockGameName: false, searchingGame: false };
  gameApiTimeout;

  consoles = [
    { icon: 'android', id: 'm' },
    { icon: 'windows8', id: 'pc' },
    { icon: 'playstation3', id: 'ps3' },
    { icon: 'playstation4', id: 'ps4' },
    { icon: 'playstation5', id: 'ps5' },
    { icon: 'xbox', id: 'xb360' },
    { icon: 'xbox', id: 'xb1' },
    { icon: 'xbox', id: 'xbx' },
    { icon: 'xbox', id: 'xbsx17' },
    { icon: 'xbox', id: 'xbsx20' },
    { icon: 'wii', id: 'wii' },
    { icon: 'appleinc', id: 'mac' },
    { icon: 'appleinc', id: 'ios' },
    { icon: '', id: 'ot' },
  ];





  @ViewChild(SuggestionsComponent) gameSuggestComp: SuggestionsComponent;

  constructor(private _apiService: APIservice,
    private _storageService: StorageService,
    private _socketService: SocketService,
    private _npService: NowplayingService,
    private _floatNotifService: FloatNotificationService) { }

  ngOnInit(): void {
    this.nowplayingForm = new FormGroup({
      game: new FormControl('', Validators.required),
      username: new FormControl(),
      audience: new FormControl(),
      stream: new FormControl(),
      imageLink: new FormControl(),
      console: new FormControl(),
      estplaytime: new FormControl(1, [Validators.min(1), Validators.max(12)]),
      desc: new FormControl(),
      hasPrivateRoom: new FormControl(),
      roomid: new FormControl(),
      password: new FormControl(),
      maxconnections: new FormControl(0, [Validators.min(0), Validators.max(150)])
    });

    new Title(document).setTitle('New Game | Spawnhouse');
  }

  saveNowPlaying() {
    let nppw; // nowplaying password of server to be saved in local
    if (!this.nowplayingForm.get('hasPrivateRoom').value) {
      this.nowplayingForm.removeControl('roomid');
      this.nowplayingForm.removeControl('password');
      this.nowplayingForm.removeControl('maxconnections');
    }
    else {
      nppw = this.nowplayingForm.get('password').value || ':o:';
      this._storageService.setSessionData("nppwd", nppw);
      this._storageService.setSessionData("accessorIds", "[]");
    }
    if (nppw === ':o:') this.nowplayingForm.patchValue({ password: ':o:' });  // server is open
    this.nowplayingForm.removeControl('hasPrivateRoom');

    this.nowplayingForm.patchValue({
      imageLink: this.gameImage
    });

    this._apiService.setNowPlaying(this.nowplayingForm.value).then(result => {
      this._socketService.pushData('new-notification', { type: 'broadcast', sentBy: this._storageService.currentUser._id, sentTo: 'follower' });

      if (nppw && nppw !== ':o:') {
        this._npService.startListeningNPpwdRequests();
      }
      this._floatNotifService.makeToast.next({ type: 'success', heading: 'Telling people about your game', text: 'You can return to game while we tell people about it'});
      this._apiService.router.navigate(['./profile']);
    }).catch( e => {
      this._floatNotifService.makeToast.next({heading: 'error', text: 'Something went wrong: '+e});
    });
  }


  gameSelect(game) {
    this.gameSuggestComp.searchInput = game.label;
    this.searchedGame = game.label;
    this.nowplayingForm.patchValue({ game: game.label });
    this.gameSuggestions = [];
    this.npflags.lockGameName = true;
  }

  searchGame(searchword) {
    if (searchword.length < 3 || searchword.trim() === '') return;
    this.npflags.searchingGame = true;
    this.searchword = searchword;

    if (this.gameApiTimeout) {
      clearTimeout(this.gameApiTimeout);
    }

    this.gameApiTimeout = setTimeout(() => {
      // console.log("Search word = ", this.searchword);
      this._apiService.getGameName(this.searchword).then(res => {
        this.gameSuggestions = res['gamedata'];
      }).catch(e => {
        this.gameSuggestions = []
      }).finally(() => {
        this.npflags.searchingGame = false;
        this.gameApiTimeout = null;
      });
    }, 500);
  }

  async pasteLink() {
    const text = await navigator.clipboard.readText().then(text => text);
    this.nowplayingForm.patchValue({
      stream: text
    });
  }

  selectConsole(console) {
    this.nowplayingForm.patchValue({
      console: new GameGenrePipe().transform(console.id, true)
    });
    this.selectedConsole = console.id;
    this.showConsoleList = false;
  }
}
