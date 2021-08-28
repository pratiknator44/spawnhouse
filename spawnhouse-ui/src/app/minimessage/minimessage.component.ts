import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'sh-minimessage',
  templateUrl: './minimessage.component.html',
  styleUrls: ['./minimessage.component.scss']
})
export class MinimessageComponent implements AfterViewInit {
  @Input() message;
  @Input() user;
  @Output() fireMessage: EventEmitter<{id: string, message: string}>;
  @Output() close: EventEmitter<boolean>;
  @ViewChild('messageBox') messageBox: ElementRef;
  sendingStatus: string;

  constructor() {
    this.fireMessage = new EventEmitter();
    this.close = new EventEmitter();
  }

  ngAfterViewInit() {
    this.messageBox.nativeElement.focus();
  }

  closeOverlay() {
    this.close.emit(false);
  }

  emitMessage() {
    if(this.message.trim().length === 0 || !this.message)  return;
    let emitob = this.user._id ? {id: this.user._id, message: this.message} : {id: null, message: this.message};
    this.fireMessage.emit(emitob);
    this.sendingStatus = 'sent';
    this.close.emit(false);
  }

}
