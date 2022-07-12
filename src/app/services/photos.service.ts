import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { rejects } from 'assert';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})

export class PhotosService {

  //  definisco array di foto, contenente riferimenti a
  //  ciascuna foto dell'utente;
  public photos: UserPhoto[] = [];

  constructor() { }

  public async addNewToGallery(){

    //  per scattare foto, con async-await, impongo di
    //  aspettare formula prima di eseguire resto codice:
    const capturedPhoto = await Camera.getPhoto({
      // fil-based data; miglior performance:
      resultType: CameraResultType.Uri,
      //  prende automatimcamente nuova foto con camera
      source: CameraSource.Camera,
// qualità: 100%
quality: 100
});
//  aggiungo l'ultima foto fatta all'inizio dell'array,
//  usando unshift:
// this.photos.unshift({
  //  elementi all'inizio dell'array:
  // filepath: "soon...",
  // webviewPath: capturedPhoto.webPath
  // });

  //  ora che ho savepicture(), posso fare che una volta scattata la
  //  foto, me l'aggiunge in cima all'array di foto
  const savedImageFile = await this.savePicture(capturedPhoto);
  this.photos.unshift(savedImageFile);
}


private async readAsBase64(photo: Photo){
  //  prendo foto da webpath
  const response = await fetch(photo.webPath!);
  //  la leggo come blob
  const blob = await response.blob();

  //  , e la converto in formato base 64:
  return await this.convertBlobToBase64(blob) as string;
}

//  quando ricevo blob, genero promise
private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
//  devo chiedere
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
    resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});

//  funzione per salvare immagine in api, a cui passo
//  il più recente oggetto Photo
  private async savePicture(photo: Photo){
//  converto photo in formato base64, per essere salvata da API
    const base64Data = await this.readAsBase64(photo);

    const fileName = new Date().getTime() + '.jpeg';
//  richiamo funzione di filesystem, per sinserire file in
//  directory, ci metto la base64data individuata con il path,
//  e lo scrivo in directory.data:
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

//  uso webpath per mostrare nuova immagine, siccome è già
//  caricato in memoria:
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }
}

//  creo interfaccia, che renderò disponibile in ogni
//  componente in cui importerò photoservice:
export interface UserPhoto{
  filepath: string;
  webviewPath: string;
}

