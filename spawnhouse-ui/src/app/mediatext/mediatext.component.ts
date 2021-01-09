import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'sh-mediatext',
  templateUrl: './mediatext.component.html',
  styleUrls: ['./mediatext.component.scss']
})
export class MediatextComponent implements OnInit {

  @ViewChild('contentdiv') contentDiv: ElementRef;
  text;
  // = `This will be converted to JoyPixels emojis! :-) :thumbsup: ❤️`;
  constructor() { }

  ngOnInit(): void {
  }

  updateText(event: KeyboardEvent) {
  }

}
