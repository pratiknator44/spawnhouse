import { Component, OnInit, ViewChild, Output, ElementRef, EventEmitter, Input } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { IPictureUploadSchema } from 'src/assets/interfaces/picture-upload-schema.interface';
import { APIservice } from 'src/assets/services/api.service';

@Component({
  selector: 'sh-imageupload',
  templateUrl: './imageupload.component.html',
  styleUrls: ['./imageupload.component.scss']
})
export class ImageuploadComponent implements OnInit {

  
  imageChangedEvent: any = '';
  croppedImage: any = '';
  temp: any;
  loadingFailed: string;
  @ViewChild('newdpOrCover') newdpOrCover: ElementRef;

  @Input() imageSchema: IPictureUploadSchema;
  @Input() mode: string = 'dp';
  @Input() isDisabled: boolean = true;
  @Input() progress: {text: '', percentage: number};
  @Output() imageSelected = new EventEmitter();
  @Output() close = new EventEmitter();
  @Output() newsubmit = new EventEmitter();
  @Output() onImageRemove = new EventEmitter();

  constructor( private _apiService: APIservice) { }

  ngOnInit(): void {
  }

  fileChangeEvent(event): void {
    // console.log("file event = ", event);
      this.imageChangedEvent = event;
      this.temp = event.target.files[0];
  }
  imageCropped(event: ImageCroppedEvent) {
      // console.log("cropped image = ", event);
      this.croppedImage = event.base64;
      // this.imageSelected.emit(this.croppedImage);
  }

  clear() {
    this.newdpOrCover.nativeElement.value = null;
  }
  hideUI() {
    this.close.emit(null);
  }

  updateNewDpCover() {
    if(this.isDisabled) return;

    let fd = new FormData();
    var imageBase64 = this.croppedImage.split(',')[1];
    const byteCharacters = atob(imageBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/jpg'});
    this.temp = new File([blob], new Date().getTime()+'.jpg');
    // console.log('new dp = ', this.temp);
    fd.append('newdp', this.temp);

    this.newsubmit.emit(fd);
  }

  removeImage() {
    if(this.isDisabled) return;
    let url = APIvars.APIdomain+'/';
    if( this.mode === 'dp') {
        url = url+APIvars.REMOVE_DP;
    } else if ( this.mode === 'cover') {
      url = url+APIvars.REMOVE_COVER;
    }

    this._apiService.removeUserImage(this.mode).then(result => {
      console.log("result = ", result);
      this.onImageRemove.emit();
    });
  }

  submitNewPicture() {
  }

  imageLoaded() {
    // show cropper
    this.loadingFailed = null;
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
      this.loadingFailed = '[Invalid File] Please select an image format';
  }
}
