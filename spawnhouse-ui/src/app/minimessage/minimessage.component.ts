import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'sh-minimessage',
  templateUrl: './minimessage.component.html',
  styleUrls: ['./minimessage.component.scss']
})
export class MinimessageComponent implements OnInit {
  @Input() message;
  @Input() user;
  @Output() fireMessage: EventEmitter<{id: string, message: string}>;
  @Output() close: EventEmitter<boolean>;

  sendingStatus: string;

  constructor() {
    this.fireMessage = new EventEmitter();
    this.close = new EventEmitter();
  }

  ngOnInit(): void {
    // this.user['dpLink'] = 
  }

  closeOverlay() {
    this.close.emit(false);
  }

  emitMessage() {
    // console.log(this.user);
    let emitob = this.user._id ? {id: this.user._id, message: this.message} : {id: null, message: this.message};
    this.fireMessage.emit(emitob);
    this.sendingStatus = 'sent';

    setTimeout(()=> {
      this.close.emit(false);
    }, 1000)

  }

}
