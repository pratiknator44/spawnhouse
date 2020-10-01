import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from 'events';

@Component({
  selector: 'sh-recepient',
  templateUrl: './recepient.component.html',
  styleUrls: ['./recepient.component.scss']
})
export class RecepientComponent implements OnInit {

  @Input() inputData: {label: string, value: string} [];
  @Output() inputChanged = new EventEmitter();
  @Output() allSelected = new EventEmitter();
  suggestResult = false;
  searchWord = '';
  suggestions = [];
  selected = [];
  constructor() { }

  ngOnInit(): void {
  }

  newInput(event) {
    console.log(event);
    this.suggestResult = true;
  }

  addThis(res) {

  }

  getSuggestions(event) {
    this.inputChanged.emit(this.searchWord);
  }

}
