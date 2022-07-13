import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})

export class PhotosService {

  //  definisco array di foto, contenente riferimenti a
  //  ciascuna foto dell'utente;
  public photos: UserPhoto[] = [];

  //  creo variabile che farà da chiave per la memoria:
  private PHOTO_STORAGE: string = 'photos';

  //  importo platform, per recuperare info dispositivo:
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  public async loadSaved() {
    //  effettuo chiamata get per leggere data di array
    //  photos salvate, quelle con key: this.photo_storage; è
    //  operazione lunga, quindi await, per dare tempo di
    //  concludersi prima di caricare il resto
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    //  trasformo array photos in lista di oggetti photolist;
    this.photos = JSON.parse(photoList.value) || [];

    //  per vedere se sta andando su web, perché non sarebbe ibrida quindi:
    if (!this.platform.is('hybrid')) {
      //  mostro foto leggendole in formato base64
      for (const photo of this.photos) {
        //  chiamo readfile da filesystem per leggere i dati di foto
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        //  solo per web, carico immagini in formato base64
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  public async addNewToGallery() {

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

    //  chiamo storage.set per salvare l'array Photos ogni volta
    //  che scatto una foto, così non si perde se chiudo app
    Storage.set({
      //  genero file json
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  public async deletePicture(photo: UserPhoto, position: number){
    //  rimuovo foto dall'array di riferimento di Photos
        this.photos.splice(position, 1);

    //  aggiornp array di photos sovrascrivendo arra esistente
        Storage.set({
          key: this.PHOTO_STORAGE,
          value: JSON.stringify(this.photos)
        });

    //  cancello file da filesystem
        const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);

        await Filesystem.deleteFile({
          path: filename,
          directory: Directory.Data
        });
      }

  private async readAsBase64(photo: Photo) {
    //  hybrid localizzerà cordoba o cpacitor
    if (this.platform.is('hybrid')) {
      //  se platform è hybrid, leggerà la foto in formato base64
      //  con filesystem's readfile
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    } else {
      //  prendo foto da webpath
      const response = await fetch(photo.webPath!);
      //  la leggo come blob
      const blob = await response.blob();

      //  e la converto in formato base 64:
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  //  quando ricevo blob, genero promise
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {

    //  faccio per far leggere file blob che mi arriva
    const reader = new FileReader();
    //  se sbaglio, reject
    reader.onerror = reject;
    //  se leggibile, notifivco con evento onload,
    reader.onload = () => {
      //  e il result diventa oggetto proprietà result di oggetto reader
      resolve(reader.result);
    };
    //  traformo blob in url tramite readasdataurl di reader;
    reader.readAsDataURL(blob);
  });

  //  funzione per salvare immagine in api, a cui passo
  //  il più recente oggetto Photo
  private async savePicture(photo: Photo) {
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

    //  se piattaform hybrid, mostro nuova immagine riscrivendo
    //  path con http
    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      //  uso webpath per mostrare nuova immagine, siccome è già
      //  caricato in memoria:
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  }


}

//  creo interfaccia, che renderò disponibile in ogni
//  componente in cui importerò photoservice:
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}

