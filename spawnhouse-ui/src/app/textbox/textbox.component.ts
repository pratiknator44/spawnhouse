import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextboxComponent implements OnInit {

  isSuggestionActive: boolean;
  textUpdate = '';
  lastWord = '';
  userSuggestions = [];
  temp;
  @ViewChild('update') update: ElementRef;

  constructor( private _http: HttpClient) { }

  ngOnInit(): void {
  }

  keys = ['Enter', 'Alt', 'Shift', 'Control', 'Tab', 'CapsLock', 'Meta', 'ContextMenu', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];
  getText(event) {
    // console.log('regex ',event.key);
    if(this.keys.includes(event.key)) return;

    if(event.key === 'Backspace') {
      let l = this.update.nativeElement.innerHTML.length - 1;
      if(this.update.nativeElement.innerHTML.charAt(l) !== ' ') {
        let ar = this.update.nativeElement.innerHTML.split(' ');
        if(ar[ar.length -1].startsWith('@')) {
          this.update.nativeElement.innerHTML = ar.slice(0, -1).join(" ");
          this.setCurrentCursorPosition(this.update.nativeElement.innerHTML.length);
        }
      }
    }

    this.temp = this.update.nativeElement;
    let innerHTML = this.update.nativeElement.innerHTML;
    switch(event.key) {
      case '@':
        this.isSuggestionActive = this.update.nativeElement.innerText.charAt(this.update.nativeElement.innterText-2) !== " ";
        break;
      case '#':
        break;
      case ' ':
      //default:
        this.isSuggestionActive = false;
        this.lastWord = '';
        break;
      case 'Backspace':
      if(innerHTML.charAt(innerHTML.length-1) === '@') {
        this.isSuggestionActive = false;
        this.lastWord = '';
      } else {
        this.lastWord = this.lastWord.slice(0, -1);
        // console.log('ast word = ', this.lastWord);
      }
        this.checkAndEraseText();
        break;
    }
    if(this.isSuggestionActive && event.key!=='@' && event.key!=='Backspace') { // start recording the letters
      this.lastWord = this.lastWord+event.key;
      if(this.lastWord !== '')
      {
        this._http.get(APIvars.APIdomain+'/mentions/'+this.lastWord).subscribe(result => {
          console.log(result);
          this.userSuggestions = result['users'];
        });
      } 
    }
  }

  updateText2( event) {
    this.textUpdate=event.target.textContent;
  }

  checkAndEraseText() {
    const lastWord = this.update.nativeElement.innerText.split(' ').pop();
    if(lastWord.startsWith("@")) {

    }
  }
  appendUser(user) {
    let innerHTML = this.update.nativeElement.innerHTML.split(" ").slice(0, -1).join(" ");
    innerHTML = innerHTML+' <span class="text-primary hover-underline">@'+(user.username || user.fname+'_'+user.lname)+'</span>&nbsp;_';
    this.update.nativeElement.innerHTML = innerHTML;
    this.userSuggestions = [];
    this.isSuggestionActive = false;
    this.setCurrentCursorPosition( this.update.nativeElement.innerText.length);
    this.isSuggestionActive = false;
    this.lastWord = '';
  }

  createRange(node, chars, range?) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                 range.setEnd(node, chars.count);
                 chars.count = 0;
            }
        } else {
            for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = this.createRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                   break;
                }
            }
        }
   } 

   return range;
};

setCurrentCursorPosition(chars) {
    if (chars >= 0) {
        var selection = window.getSelection();

        let range = this.createRange(this.update.nativeElement, { count: chars });

        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};
}
