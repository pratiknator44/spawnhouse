import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'sh-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss']
})
export class ChipsComponent implements OnInit {

  @Input() items: {label: any, value: any, extra?: any}[];
  @Input() max: number;
  @Input() selected: {label: any, value: any, extra?: any}[] = [];
  @Input() config: {showFav: boolean, showCross: boolean, placeholder: String | Number};
  @Output() selectionChange = new EventEmitter<{label: any, value: any, extra?: any}[]>();
  @Output() queryChange = new EventEmitter<string>();
  @Output() emitCrossClick = new EventEmitter<Number>();
  
  searchword: string = '';
  isLimitReached: boolean;

  constructor() { }
  ngOnInit(): void {
    if(!this.selected) {
      this.selected = [];
    }
  }

  pushToSelected(item) {
    this.selected.push(item);
    let l = this.items.length;
    for(let x=0; x<l; x++) {
      if(this.items[x].value === item.value) {
        this.items.splice(x, 1);
        break;
      }
    }
    this.selectionChange.emit(this.selected);
    this.searchword = '';
    this.items = [];
    if(this.max && this.selected.length === this.max) {
      this.isLimitReached = true;
    }
  }

  removeItem(index) {
    this.selected.splice(index, 1);
    // for( let x = 0; x < l; x++) {
    //   if(item.value === this.selected[x].value) {
    //     console.log(this.selected[x]);
    //     this.selected.splice(x+1, 1);
    //     break;
    //   }
    // }
    this.selectionChange.emit(this.selected);
  }

  newQuery(word:KeyboardEvent) {
    if(word.code === 'Backspace') { //backspace
      this.items = [];
    }
    this.queryChange.emit(this.searchword);
  }

  setFavoriteByIndex(i) {

    // if not set/unfav
    try {
      if(this.selected[i].value.isFav) {
        delete this.selected[i].value.isFav
      } else {
        this.selected[i].value['isFav'] = true
      }
    } catch {
      this.selected[i].value = {};
      this.selected[i].value['isFav'] = true
    }

    // if(this.selected[i].value === 'fav') {
    //   this.selected[i].value = '';
    // } else {
    //   this.selected[i].value = 'fav';
    // }
    this.selectionChange.emit(this.selected);
  }

  crossClicked(index) {
    this.emitCrossClick.emit(index);
    this.selected.splice(index, 1);
  }

}
