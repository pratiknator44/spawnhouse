import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'sh-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss']
})
export class SuggestionsComponent implements OnInit {

  @Input() placeholder: string;
  @Input() icon: string;
  @Input() template: TemplateRef<any>
  @Input() inProgress: boolean;
  @Output() inputChanged = new EventEmitter();
  @Output() selected = new EventEmitter();
  searchInput: string ='';

  constructor() { }
  ngOnInit(): void {
  }

  emitSearchWord() {
    console.log('emitting  ', this.searchInput);
    this.inputChanged.emit(this.searchInput);
  }
}
