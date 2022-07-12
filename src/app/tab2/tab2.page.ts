import { Component } from '@angular/core';
import { PhotosService } from '../services/photos.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(public photoS: PhotosService) {}

  addPhotoToGallery(){
//  richiamo funzione da photoService
    this.photoS.addNewToGallery();
  }

}
