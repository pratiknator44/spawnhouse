import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { APIservice } from 'src/assets/services/api.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-profile-management',
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.scss']
})
export class ProfileManagementComponent implements OnInit {

  user: any;
  items: any
  gameSuggestions: {label: string, value: string}[] = [];
  gamedataForm: FormGroup;
  userinfoForm: FormGroup;
  saveText = {videogame: 'Save', personal: 'Save', type: 'Save'};
  selectedSection: Number = 0;
  mgtFlags = {loadingData: true, usernameExists: false, checkingUsername: false};
  genres = [
    {id: 'action', genre: 'Action', example: 'PUBG, Call of Duty, Counter-Strike', checked: ''},
    {id: 'actionadv', genre: 'Action Adventure', example: 'GTA, Legend Of Zelda, Metal Gear, Assassins\' Creed', checked: ''},
    {id: 'race', genre: 'Racing', example: 'Need for Speed, Asphault, Moto GP, Midtown Madness', checked: ''},
    {id: 'adv', genre: 'Adventure', example: 'Day of the Tentacle, Indiana Jones, Broken Sword: Shadow of Templars', checked: ''},
    {id: 'rpg', genre: 'RPGs (Role Playing Games)', example: 'Witcher, Skyrim, Dark Souls, Mass Effect, Fall', checked: ''},
    {id: 'sim', genre: 'Simulation', example: 'Flight Simulator, X-Planes', checked: ''},
    {id: 'sport', genre: 'E Sports', example: 'EA Cricket, FIFA, NBA Live', checked: ''},
    {id: 'board', genre: 'Board Games', example: 'Chess Master, Ludo King', checked: ''},
    ];
  pageSections = [{title: 'gaming', icon: 'game-controller'},
                  {title: 'personal', icon: 'user'},
                  {title: 'account', icon: 'cog'}
                ];
  playerTypes = [
    {id: 'as', icon: 'assaulter', checked: false},
    {id: 'df', checked: false},
    {id: 'sn', checked: false},
    {id: 'md', checked: false},
    {id: 'st', checked: false},
    {id: 'sp', checked: false},
    {id: 'fr', checked: false},
    {id: 'co', checked: false},
  ];
  customcomment;
  recommendIndex;
  
  constructor(
    private _storageService: StorageService,
    private _http: HttpClient,
    private _navbarService: NavbarService,
    private _apiService: APIservice,
    private _modalService: NgbModal) { }

  ngOnInit(): void {
    this.user = this._storageService.currentUser;
    // console.log('user ', this.user);
    this.gamedataForm = new FormGroup({
      fav: new FormControl([]),
      genres: new FormControl([]),
      gameUsernames: new FormControl([])
    });

    this.userinfoForm = new FormGroup( {
      fname: new FormControl(this.user.fname, [Validators.required, Validators.pattern(/^[a-zA-Z]+ [a-zA-Z]+$/)]),
      lname: new FormControl(this.user.lname, [Validators.required, Validators.pattern(/^[a-zA-Z]+ [a-zA-Z]+$/)]),
      username: new FormControl(this.user.username || ''),
      website: new FormControl(this.user.website || ''),
      bio: new FormControl(this.user.bio || ''),
      quote: new FormControl(this.user.quote || '')
    });
    this.getUserSettings();
  }

  getUserSettings() {
      // videogame settings
      this.mgtFlags.loadingData = true;
      this._http.get(APIvars.APIdomain+'/'+APIvars.SET_USER_GAMEDATA).subscribe( result => {
        // console.log("user settings === ", result);
        if(result['result']) {
          try {
            let l = result['result']['genres'].length || 0;
            let gl = this.genres.length;
            
            // pre-select the checklist
            for(let x=0; x<l; x++) {
              for(let y=0; y<gl; y++) {
                if(result['result']['genres'][x] === this.genres[y].id) {
                  this.genres[y].checked = 'ok';
                }
              }
            }

            this.gamedataForm.patchValue({
              genres: result['result']['genres']
            });

          } catch(e) {
            console.error("found error ", e);
            this.gamedataForm.patchValue({
              genres: []
            });  
          }

          this.items = result['result']['fav'];

          try {
            this.gamedataForm.patchValue({
              fav: this.items
            });
          }catch (e) {
            this.gamedataForm.patchValue({
              fav: []
            });
          }


          if(result['result']['playerType']) {
            let l = result['result']['playerType'].length;  
            for(let x=0; x<l; x++) {
              for(let y=0; y<8; y++) {
                this.playerTypes[y].id === result['result']['playerType'][x] ? this.playerTypes[y].checked = true : false;
              }
            }
          }
        }
        this.mgtFlags.loadingData = false;
      });  
  }


  newSelections(items) {
    console.log("new selections: ", items);
    this.gamedataForm.patchValue({
      fav: items
    });
  }

  queryChange(word) {
    // this.items = [];
    if(word.length > 2) {
      this._http.get(APIvars.APIdomain+'/'+APIvars.GET_GAMEDATA+'/'+word).pipe(debounceTime(1000)).subscribe( data => {
        this.gameSuggestions = data['gamedata'];
        this.gamedataForm.patchValue({
          favs: this.gameSuggestions
        });
    });
    }
  }

  submitGamedata() {
    if(this.saveText.videogame === 'Saving...') return;
    this.saveText.videogame = 'Saving...';
    console.log(this.gamedataForm.value);
    this._http.post(APIvars.APIdomain+'/'+APIvars.SET_USER_GAMEDATA, this.gamedataForm.value).subscribe( result => {
      if(result['message'] = 'passed') {
        this.saveText.videogame = 'Saved!';
      } else {
        this.saveText.videogame = 'Failed, try again!';
      }
    });
  }

  updateGenreCheckList(event: MouseEvent, id) {
    let ar: Array<string> = this.gamedataForm.get('genres').value;
    if(event.target['checked']) {
      ar.push(id);
    }
    else {
      let i = ar.indexOf(id);
      ar.splice(i,1);
    }
    this.gamedataForm.patchValue({
      genres: ar
    });

    console.log("genre checked ", ar);
  }

  submitUserdata() {
    this.saveText.personal = 'Saving...';
    this._http.patch(APIvars.APIdomain+'/'+APIvars.SET_USERDATA, this.userinfoForm.value).subscribe(result => {
      // console.log('result ======== ', result);
      if(result['message'] === 'passed') {
        this.saveText.personal = 'Saved!'

        // get fresh user data from api
        this._http.post(APIvars.APIdomain+'/'+APIvars.GET_USERDATA, {properties: 'personal'}).subscribe( result => {
          console.log("get userdata ", result);
          sessionStorage.setItem('user', JSON.stringify(result['result']));
          this._navbarService.refreshUser.next();
        });

      } else {
        this.saveText.personal = 'Failed, try again!'
      }
    });
  }
  
  selectType(index) {
    const count = this.playerTypes.filter((obj) => obj.checked === true).length;
    if(count > 2 && !this.playerTypes[index].checked) {
      return;
    }
    this.playerTypes[index].checked = !this.playerTypes[index].checked;
  }

  savePlayerType() {
    if(this.saveText.type === 'Saving...')  return;
    this.saveText.type = 'Saving...';
    const selected = this.playerTypes.filter((obj) => obj.checked).map(ob => ob.id);
    this._apiService.updatePlayerType(selected).then(result => {
      console.log("saving done");
      this.saveText.type = 'Saved!';
    });
  }

  checkUsername() {
    if(this.userinfoForm.get('username').value.trim() === '') return;
    this.mgtFlags.checkingUsername = true;
    this._apiService.exists("username", this.userinfoForm.get('username').value.trim()).then(result => {
      this.mgtFlags.usernameExists = result['status'];
      this.mgtFlags.checkingUsername = false;
    })
  }

  confirmDelete(template) {
    this._modalService.open(template, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
    }, (reason) => {
    });
  }
  
  initiateAccountDelete() {    
    this._apiService.deleteAccount().then(response => {
      if(response['message'] === 'passed') {
        this._apiService.logout();
      }
    })
  }

}
