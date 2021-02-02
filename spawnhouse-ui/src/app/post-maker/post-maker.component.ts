import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { debounceTime } from 'rxjs/operators';
import { APIservice } from 'src/assets/services/api.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-post-maker',
  templateUrl: './post-maker.component.html',
  styleUrls: ['./post-maker.component.scss']
})
export class PostMakerComponent implements OnInit {

  chipsSuggestion = [];
  pmFlags = {tagStatus: false, imageStatus: false, showAllTaggedUsers: false, mentionmode: false, fileOpenDisabled: false, imageReady: false, doneCropping: false, statusHasImage: false, invalidFileSelect: false, uploadingStatus: false};
  templateVars = {lengthOfTaggedUsersArray: 2}   // used only in html templates;
  taggedUsers = [];
  mentionSuggestions = [];
  regexForKeys = /^[a-zA-Z0-9\s@]{1}$/;
  searchWordCollector = '';
  // postText: string;
  userdp;
  uploadProgress: Number;
  cachedIDs = []; // used to cache ID and add the mentions in case the user mentions.
  
  imageChangedEvent;
  imageFile;
  croppedImage;

  @ViewChild('postarea') postArea: ElementRef;

  constructor(private _apiService: APIservice,
    private _storageService: StorageService,
    private _overlayService: OverlayService) { }

  ngOnInit(): void {

    this.userdp = this._apiService.getUserImageById('dp', this._storageService.currentUser._id);
  }

  searchUsersToTag(searchWord) {
    this.chipsSuggestion = [];

    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.SEARCH_USER+'/'+searchWord).pipe(debounceTime(1000)).subscribe( res => {
      if(res['users'].length > 0) {
        let userid = [];
        console.log("users = ", res['users']);
        res['users'].forEach( user => {
          this.chipsSuggestion.push({label: 'username' in user && user.username ? user.username : user.fname+' '+user.lname, subtext: 'fname' in user ? user.fname : '', value: user._id})
        });
      }
    });
  }

  newSelections(selections) {
    console.log("new selection from home > post-maker > chips ", selections);
    this.taggedUsers = selections
  }

  lookForFeature(key) {
    if(this.postArea.nativeElement.innerHTML.length === 0)  { this.pmFlags.mentionmode = false; this.mentionSuggestions = [];}
    if(!this.regexForKeys.test(key.key))  return;
    if(key.key === '@') { this.pmFlags.mentionmode = true; this.searchWordCollector = ''; }
    else if(key.key === ' ')  {this.pmFlags.mentionmode = false; this.searchWordCollector = ''}

    if(this.pmFlags.mentionmode && key.key!=='@')  {
      this.searchWordCollector = this.searchWordCollector + key.key;
      this._apiService.getUserByMention(this.searchWordCollector).then( users => {
        this.mentionSuggestions = users['result'];
        const l = this.mentionSuggestions.length;
        for(let x=0; x<l; x++) {
          this.mentionSuggestions[x]['dp'] = this._apiService.getUserImageById('dp', this.mentionSuggestions[x]['_id']);
        }
      });
    }
  }

  selectedUser(user) {
    this.mentionSuggestions = [];
    this.pmFlags.mentionmode = false;
    const lastIndexOfSpace = this.postArea.nativeElement.innerHTML.lastIndexOf('@');
    this.postArea.nativeElement.innerHTML = this.postArea.nativeElement.innerHTML.substr(0, lastIndexOfSpace);
    this.postArea.nativeElement.innerHTML = this.postArea.nativeElement.innerHTML + ' <span class="text-theme">@' + user.username+'</span>&nbsp;';
    this.setCaretToEnd();
    this.cachedIDs.push({_id: user._id, username: user.username});
  }

  setCaretToEnd() {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(this.postArea.nativeElement);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    this.postArea.nativeElement.focus();
    range.detach(); // optimization
  
    // set scroll to the end if multiline
    this.postArea.nativeElement.scrollTop = this.postArea.nativeElement.scrollHeight; 
  }

  savePost() {
    // this.getTaggedUsersList(this.postArea.nativeElement.innerHTML);
    if(this.pmFlags.uploadingStatus)  return;
    this.pmFlags.uploadingStatus = true;
    let postOb = {
      desc: this.postArea.nativeElement.innerHTML,
      audience: 0,
      location: null,
      type: this.pmFlags.statusHasImage ? 2 : 1
    }

    if(this.pmFlags.statusHasImage) {
      const fd = this.encodeImageForUpload();
      console.log("form data = ", fd);
      this._apiService.setPostImage(fd).subscribe(imageData => {
        console.log("image data = ", imageData);

        // progress show
        if(imageData.type === HttpEventType.UploadProgress) {
          // console.log('sent config ');
          this.uploadProgress = imageData.loaded *100 / imageData.total;
        }

        else if(imageData.message === "passed" || ('body' in imageData && imageData.body.message==="passed")) {
          // upload text data now
          postOb['filename'] = imageData.filename;
          updateStatus(this, postOb);
        }
      });
    } else {
      updateStatus(this, postOb);
    }

    function updateStatus(local, postOb) {
      local._apiService.savePost(postOb).then(result => {
        local.pmFlags.uploadingStatus = false;
        if(result.message === "passed")
          local._apiService.refreshPosts.next(result.result);
          local.reset();
      });  
    }
  }

  // gives user IDs of users who's names were selected for tags
  getTaggedUsersList(str) {
    str = str.split(' ');
    const l = str.length;
    let tagged = [];
    // get words starting with @
    for(let x=0; x<l; x++) {
      if(str[x].startsWith('@')) {
        const i = this.cachedIDs.findIndex(user => {
          user.username === str[x].slice(1);
        });
        if(i > -1) tagged.push(this.cachedIDs[x]._id);
      }
    }

    console.log("Tagged people IDs ", tagged);
  }

  imageLoaded() {
    this.pmFlags.doneCropping = false;
  }
  loadImageFailed() {
    this.pmFlags.invalidFileSelect = true;
    this.removeImage();
    setTimeout( () => {
      this.pmFlags.invalidFileSelect = false;
    }, 5000);
  }

  
  fileChangeEvent(event): void {
    console.log("file event = ", event);
      this.imageChangedEvent = event;
      this.imageFile = event.target.files[0];
  }

  
  imageCropped(event: ImageCroppedEvent) {
    // console.log("cropped image = ", event);
    this.croppedImage = event.base64;
    // this.imageSelected.emit(this.croppedImage);
  }

  showOverlay() {
    this._overlayService.configSubject.next({closeonclick: false, transparent: false});
    this._overlayService.showSubject.next(true);
  }

  croppingDone() {
    this.pmFlags.doneCropping = true;
    this.pmFlags.statusHasImage = true;
  }

  removeImage() {
    this.pmFlags.statusHasImage = false;
    this.pmFlags.doneCropping = false;
    this.imageFile = null;
  }

  reset() {
    this.postArea.nativeElement.innerHTML = "";
    this.removeImage();
  }

  encodeImageForUpload() {
    let fd = new FormData();
    var imageBase64 = this.croppedImage.split(',')[1];
    const byteCharacters = atob(imageBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/jpg'});
    this.imageFile = new File([blob], new Date().getTime()+'.jpg');
    fd.append('postimage', this.imageFile);
    console.log("image fd = ", fd);
    return fd;
  }
}

