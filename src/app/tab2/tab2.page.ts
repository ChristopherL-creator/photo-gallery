import { Component } from '@angular/core';
import { PhotosService, UserPhoto  } from '../services/photos.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
//  action sheet è finestra che mostra dialoghi e opzioni:
  constructor(public photoS: PhotosService, public actionSheetController: ActionSheetController) {}

//  chiamo metodo loadsaved da service, in tab2, in modo che sia
//  la prima cosa che carichi con la pagina:
  async ngOnInit(){
    await this.photoS.loadSaved();
  }

  addPhotoToGallery(){
//  richiamo funzione da photoService:
    this.photoS.addNewToGallery();
  }

  public async showActionSheet(photo: UserPhoto, position: number){
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoS.deletePicture(photo, position);
        }
    }, {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => { }
    }]
    });
    await actionSheet.present();
  }

}
