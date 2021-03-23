import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { APIservice } from 'src/assets/services/api.service';
import { NowplayingService } from 'src/assets/services/now-playing.service';

@Component({
  selector: 'sh-now-playing-side-dock',
  templateUrl: './now-playing-side-dock.component.html',
  styleUrls: ['./now-playing-side-dock.component.scss']
})
export class NowPlayingSideDockComponent implements OnInit {

  np = [];
  npRecent = [];      // contains users which were recently active;
  sdFlags = {refreshing: false}
  @Output() total = new EventEmitter<number>();

  constructor(private _nowplayingService: NowplayingService,
              private _apiService: APIservice) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this._apiService.getNowPlayingOfFollowing().then(nowplayings => {
      this.np = nowplayings['result'] || [];
      //getting dp of updated entries
      this.getDpOfEntries();
      this.total.emit(this.np.length);
    });
  }

  getDpOfEntries() {
    const l = this.np.length;
    for(let x=0; x < l; x++) {
      this.np[x]['dp'] = this._apiService.getUserImageById('dp', this.np[x]._id);
      this.np[x]['stillplaying'] = (3600000 * this.np[x]['nowplaying']['estplaytime']) > (new Date().getTime() - this.np[x]['nowplaying']['time']);  
    }

    this.np.sort( (a, b) => b.stillplaying ?  1 : -1);

  }

  routeToProfile(id) {
    this._apiService.router.navigateByUrl('/'+id);
  }

}
