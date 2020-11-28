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
  @Input() showSuggestions: boolean = true;
  @Input() searchInput: string ='';
  @Output() inputChanged = new EventEmitter();
  @Output() selected = new EventEmitter();

  constructor() { }
  ngOnInit(): void {
  }

  emitSearchWord() {
    if(this.searchInput === '') {
      this.showSuggestions = false;
    } else this.showSuggestions = true;
    this.inputChanged.emit(this.searchInput);
  }
}
