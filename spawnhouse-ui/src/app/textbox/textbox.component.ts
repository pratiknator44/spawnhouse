import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextboxComponent implements OnInit {

  isSuggestionActive: boolean;
  type: '@' | '#';        // for hashtag or mentioning people
  hashtagSuggestions = [{tagname: 'A tag', timesused: 200}, {tagname: 'A tag', timesused: 200}, {tagname: 'A tag', timesused: 200}];
  @ViewChild('textUpdate', {static: false}) textUpdate: ElementRef;

  mentionCounter = 0;   // acitvates when user types @ or # so suggestions are shown after certain chartacters
  mentionState: boolean;

  constructor( private _http: HttpClient) { }
  ngOnInit(): void {
  }

  getText(event) {
    switch(event.key) {
      case '@': 
        this.isSuggestionActive = true;
        this.type = '@';
        this.mentionCounter = 0;
        this.mentionState = true;
        break;
      case '#':
        this.isSuggestionActive = true;
        this.type = '#';
        this.mentionCounter = 0;
        break;

      case ' ':
      //default:
        this.isSuggestionActive = false;
        break;
      case 'Backspace':
        // innerText = this.textUpdate.nativeElement.innerText;
        // console.log(innerText);
        break;
    }
    let innerText = this.textUpdate.nativeElement.innerText;
    let innerHTML = this.textUpdate.nativeElement.innerHTML;
    let hashtext = innerHTML.split(this.type);
    console.log('sign position = ', hashtext);
    hashtext = hashtext[hashtext.length - 1];

    if(this.isSuggestionActive) {
      this.mentionCounter++;
      this.mentionState = hashtext.length > 2;
      if(this.mentionState) {
        console.log('calling api for ', hashtext);
        this._http.get(APIvars.APIdomain+'/'+APIvars.GET_HASHTAGS+'/'+hashtext).subscribe( tags => {
          console.log('got data', tags);
          this.hashtagSuggestions = tags['hashtags'].map( tag =>{
            return {tagname: tag.tagname, timesused: tag.timesused}; })
        })
      }
    }
  }

  appendText(mentionedText) {
    if(this.mentionState){
      console.log(this.textUpdate.nativeElement.innerHTML);
      console.log('text = ' , this.textUpdate);
      let innerHTML = this.textUpdate.nativeElement.innerHTML.split(this.type);
      console.log(innerHTML.pop());
      innerHTML = innerHTML.join(this.type);
      this.textUpdate.nativeElement.innerHTML = innerHTML + '<span class="text-primary cursor-pointer">'+this.type+mentionedText+'</span>&nbsp;';
      this.isSuggestionActive = false;
      this.mentionState = false;
      this.hashtagSuggestions = [];
    }
  }

}
