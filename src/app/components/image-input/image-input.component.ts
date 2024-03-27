import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupConfig, PopupsService } from '../../custom-services/popup/popups.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { FullscreenComponentEventResultSubjectPayload, FullscreenComponentService } from '../../custom-services/fullscreen-component/fullscreen-component.service';
import { AspectRatio, checkImageAspectRatio } from '../edit-photo/edit-photo.component';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrl: './image-input.component.scss'
})
export class ImageInputComponent {
  onEditPhotoResultSubscription: Subscription;
  onEditPhotoResultId: string = '';
  editedPhotoBase64: string = '';
  @ViewChild('input') input: ElementRef;
  @Input('default-src') defaultSrc: string = '';
  @Input('read-only') readOnly: boolean = false;
  @Output('cropped-image') cropImage: EventEmitter<AddPhotoEventData> = new EventEmitter<AddPhotoEventData>();

  constructor(private _popupService: PopupsService, private _imageCompressService: NgxImageCompressService, private _fullscreenComponentService: FullscreenComponentService) { }

  ngOnInit(): void {
    this.onEditPhotoResultSubscription = this._fullscreenComponentService.resultSuject.subscribe({
      next: async (next: FullscreenComponentEventResultSubjectPayload) => {
        if (next.id != this.onEditPhotoResultId) {
          return;
        }
        this.onEditPhotoResultId = '';
        this.input.nativeElement.value = '';
        if (!next.closed) {
          //var compressedImage: string = await this._imageCompressService.compressFile(next.result, -1, 60, 100);
          //this.cropImage.emit(compressedImage);
          this.cropImage.emit(next.result);
          this.editedPhotoBase64 = next.result.base64;
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.onEditPhotoResultSubscription.unsubscribe();
  }

  onAddPhotoCLick(): void {
    this.input.nativeElement.click();
  }

  async onFileOpen(event: any): Promise<void> {
    if (event.target.files[0] == undefined) {
      return;
    }
    var file = event.target.files[0];
    var size: number = parseInt((file.size / 1024 / 1024).toFixed(2));
    var mimeType: string = file.type;
    var popupConfig: PopupConfig = {
      type: 'alert',
      text: '',
    };
    if (size >= 5) {
      popupConfig.text = 'Image too big, please upload a smaller one < 5MB';
      this._popupService.openPopup(popupConfig);
      this.input.nativeElement.value = '';
      return;
    }
    if (!['image/png'].includes(mimeType)) {
      popupConfig.text = 'Unsupported image file. Supported files are: png';
      this._popupService.openPopup(popupConfig);
      this.input.nativeElement.value = '';
      return;
    }
    var base64Image: string = await this._convertToBase64(event.target.files[0]);
    this.onEditPhotoResultId = this._fullscreenComponentService.open('edit-photo', {
      openedImage: base64Image,
      aspectRatio: imageAspectRatio,
    });
  }

  private _convertToBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = async () => {
        if (typeof fileReader.result !== 'string') {
          rej('File was not converted to base64');
          return;
        }
        var compressedImage: string = await this._imageCompressService.compressFile(String(fileReader.result), -1, 40, 70);
        res(fileReader.result);
      };
      fileReader.onerror = (error) => {
        rej(error);
        return;
      };
    });
  }
}

const imageAspectRatio: AspectRatio = {
  width: 223,
  height: 103,
};

export function checkIfImageIsValid(imageBase64: string): Promise<boolean> {
  return checkImageAspectRatio(imageBase64, imageAspectRatio);
}

export interface AddPhotoEventData {
  blob: Blob;
  base64: string;
}
