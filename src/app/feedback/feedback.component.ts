import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { APIservice } from 'src/assets/services/api.service';

@Component({
  selector: 'sh-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  @Output() aftersave = new EventEmitter();
  stars = [
    {label: 'Not worth my time', filled: false, color: 'secondary'},
    {label: 'Alot missing', filled: false, color: 'danger'},
    {label: 'Can do better', filled: false, color: 'warning'},
    {label: 'Great work but...', filled: false, color: 'warning'},
    {label: 'Over Powered!', filled: false, color: 'success'},
  ];

  generalOptions = [
    {label:'UI not upto the mark', value: 'UI', checked: false},
    {label:'Slow service', value: 'slow', checked: false},
    {label:'Hard to understand how it works', value: 'hard', checked: false},
    {label:'I dont feel safe on Spawnhouse', value: 'unsafe', checked: false},
  ]
  hoveringOverIndex;
  feedbackFlags = {lockRating: false, saving: false};
  text = '';
  @Input() submitButtonText = 'Submit'
  
  error;
  constructor( private _apiService: APIservice) { }

  ngOnInit(): void {
  }

  saveFeedback() {
    if(this.feedbackFlags.saving) return;
    const rating = this.hoveringOverIndex || null;
    this.text = this.text.trim();
    
    if(!(rating || this.text))  return;
    this.submitButtonText = 'Submitting...';
    this.feedbackFlags.saving = true;

    // add general options to text
    const l = this.generalOptions.length;
    let str = '; ';
    for(let x=0; x<l; x++) {
      if(this.generalOptions[x].checked) {
        str = str+this.generalOptions[x].value+'; ';
      }
    }
    this.text = this.text+str;

    this._apiService.saveFeedback(rating, this.text).then(result => {
      this.feedbackFlags.saving = false
      this.aftersave.emit('');
      this.submitButtonText = 'Your response has been saved! Thank You';
      this.text = '';
      this.generalOptions = [];
    }).catch(error => {
      
      this.feedbackFlags.saving = false;
      this.error = error.error;
    });
  }

}
