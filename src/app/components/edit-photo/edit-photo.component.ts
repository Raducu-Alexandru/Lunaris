import { Component, Output, EventEmitter, ViewChild, ElementRef, Input, SimpleChange, OnInit, OnChanges } from '@angular/core';
import { FullscreenComponentEventResult, FullscreenComponentService } from '../../custom-services/fullscreen-component/fullscreen-component.service';

@Component({
	selector: 'app-edit-photo',
	templateUrl: './edit-photo.component.html',
	styleUrls: ['./edit-photo.component.css'],
})
export class EditPhotoComponent implements OnInit, OnChanges {
	desiredAspectRatio: string = 'auto';

	showAdjuster: boolean = false;
	inDragEvent: boolean = false;

	initialZoomValue: number = 100;
	minZoomValue: number = 1;
	maxZoomValue: number = 200;
	currentZoomValue: number = 100;

	loadedImageBase64: string = '';
	croppedImageBase64: string = '';

	loadedImageBase64Height: number = 0;
	loadedImageBase64Width: number = 0;

	imageStyleHeight: number;
	imageStyleWidth: number;

	imageStyleTop: number = 0;
	imageStyleLeft: number = 0;

	lastPosition: Position;

	croppedImageCanvas: HTMLCanvasElement;

	pressedDone: boolean = false;

	mainClientWidth: number;
	mainClientHeight: number;

	@ViewChild('maskImage') masImagekElement: ElementRef;
	loadedImageElement: ElementRef;
	@ViewChild('loadedImage', { static: false }) set content(content: ElementRef) {
		if (content) {
			// initially setter gets called with undefined
			this.loadedImageElement = content;
			setTimeout(() => {
				this.mainClientWidth = this.loadedImageElement.nativeElement.clientWidth;
				this.mainClientHeight = this.loadedImageElement.nativeElement.clientHeight;
				console.log(this.mainClientWidth, this.mainClientHeight);
			}, 100);
		}
	}
	@ViewChild('zoomRange') zoomRangeElement: ElementRef;
	@Input('load-image') loadedImage: Blob;
	@Input('aspect-ratio') aspectRatio: AspectRatio;
	@Output('cropped-image') croppedImage: EventEmitter<FullscreenComponentEventResult> = new EventEmitter<FullscreenComponentEventResult>(); // convert to base64 using canvas.toDataURL('image/png');

	constructor(private _fullscreenComponentService: FullscreenComponentService) {}

	async ngOnInit(): Promise<void> {
		this.desiredAspectRatio = String(this.aspectRatio.width) + ' / ' + String(this.aspectRatio.height);
	}

	onCloseClick(): void {
		var resultObject: FullscreenComponentEventResult = {
			closed: true,
			result: {
				base64: '',
				blob: null,
			},
		};
		this.croppedImage.emit(resultObject);
		this._fullscreenComponentService.emitEvent(resultObject);
	}

	async onDoneClick(): Promise<void> {
		if (this.pressedDone) {
			return;
		}
		this.pressedDone = true;
		var resultObject: FullscreenComponentEventResult = {
			closed: false,
			result: {
				base64: this.croppedImageCanvas.toDataURL('image/png'),
				blob: await this._convertToCanvasBlob(this.croppedImageCanvas),
			},
		};
		this.croppedImage.emit(resultObject);
		this._fullscreenComponentService.emitEvent(resultObject);
		this.pressedDone = false;
	}

	async ngOnChanges(change: any): Promise<void> {
		this.resetVariables();
		var loadedImageSimpleChange: SimpleChange = change.loadedImage;
		var base64Img: string = '';
		if (loadedImageSimpleChange == undefined || loadedImageSimpleChange.currentValue == null) {
			return;
		}
		//base64Img = await this.convertToBase64(loadedImageSimpleChange.currentValue);
		base64Img = loadedImageSimpleChange.currentValue;
		var imageSize: ImageSize = await getImageSize(base64Img);
		this.loadedImageBase64Height = imageSize.height;
		this.loadedImageBase64Width = imageSize.width;
		this.loadedImageBase64 = base64Img;
		this.showAdjuster = true;
	}

	resetVariables() {
		this.showAdjuster = false;
		this.imageStyleHeight = undefined;
		this.imageStyleWidth = undefined;
		this.imageStyleTop = 0;
		this.imageStyleLeft = 0;
		this.loadedImageBase64Height = 0;
		this.loadedImageBase64Width = 0;
		this.loadedImageBase64 = '';
		this.croppedImageBase64 = '';
		this.lastPosition = undefined;
	}

	finishedLoadingImage() {
		if (this.loadedImageBase64Width / this.loadedImageBase64Height < this.aspectRatio.width / this.aspectRatio.height) {
			this.imageStyleWidth = 100;
		} else {
			this.imageStyleHeight = 100;
		}
		setTimeout(() => {
			this.drawCanvas();
		}, 50);
	}

	onZoomChange(event: Event) {
		var eventValue: number = parseInt(event.target['value']);
		var zoomChange: number = eventValue - this.currentZoomValue;
		this.currentZoomValue = eventValue;
		var newLeft: number;
		var newTop: number;
		var lastHeight: number = this.loadedImageElement.nativeElement.clientHeight;
		var lastWidth: number = this.loadedImageElement.nativeElement.clientWidth;
		console.log(this.mainClientWidth, this.mainClientHeight);
		this.loadedImageElement.nativeElement.style.width = (this.currentZoomValue * this.mainClientWidth) / 100 + 'px';
		this.loadedImageElement.nativeElement.style.height = (this.currentZoomValue * this.mainClientHeight) / 100 + 'px';
		/* if (this.loadedImageBase64Width <= this.loadedImageBase64Height) {
      this.loadedImageElement.nativeElement.style.width = (this.currentZoomValue * this.mainClientWidth) / 100 + 'px';
    } else {
      this.loadedImageElement.nativeElement.style.height = (this.currentZoomValue * this.mainClientHeight) / 100 + 'px';
      this.loadedImageElement.nativeElement.style.height = this.currentZoomValue + '%';
    } */
		var maskHeight: number = this.masImagekElement.nativeElement.offsetHeight;
		var maskWidth: number = this.masImagekElement.nativeElement.offsetWidth;
		var displayedImageHeight: number = this.loadedImageElement.nativeElement.clientHeight;
		var displayedImageWidth: number = this.loadedImageElement.nativeElement.clientWidth;
		if (zoomChange > 0) {
			console.log(zoomChange);
			newTop = this.imageStyleTop + (lastHeight - displayedImageHeight) / 2;
			this.imageStyleTop = newTop;
			newLeft = this.imageStyleLeft + (lastWidth - displayedImageWidth) / 2;
			this.imageStyleLeft = newLeft;
		} else {
			newTop = this.imageStyleTop - (displayedImageHeight - lastHeight) / 2;
			if (newTop > 0) {
				newTop = 0;
			}
			this.imageStyleTop = newTop;
			newLeft = this.imageStyleLeft - (displayedImageWidth - lastWidth) / 2;
			if (newLeft > 0) {
				newLeft = 0;
			}
			this.imageStyleLeft = newLeft;
		}
		if (Math.abs(this.imageStyleTop) + maskHeight >= displayedImageHeight) {
			newTop = -(displayedImageHeight - maskHeight);
			if (newTop > 0) {
				newTop = 0;
			}
			this.imageStyleTop = newTop;
		}
		if (Math.abs(this.imageStyleLeft) + maskWidth >= displayedImageWidth) {
			newLeft = -(displayedImageWidth - maskWidth);
			if (newLeft > 0) {
				newLeft = 0;
			}
			this.imageStyleLeft = newLeft;
		}
		this.drawCanvas();
	}

	startMoveLoadedImageTouch(event: TouchEvent) {
		if (this.inDragEvent) {
			event.preventDefault();
			return;
		}
		if (event.changedTouches.length != 1) {
			event.preventDefault();
			return;
		}
		this.inDragEvent = true;
		this.lastPosition = {
			clientX: event.changedTouches[0].clientX,
			clientY: event.changedTouches[0].clientY,
		};
	}

	startMoveLoadedImageDrag(event: MouseEvent) {
		if (this.inDragEvent) {
			event.preventDefault();
			return;
		}
		this.inDragEvent = true;
		this.lastPosition = {
			clientX: event.clientX,
			clientY: event.clientY,
		};
	}

	moveLoadedImageTouch(event: TouchEvent) {
		event.preventDefault();
		if (!this.inDragEvent) {
			return;
		}
		if (event.changedTouches.length != 1) {
			this.triggerEvent(this.loadedImageElement.nativeElement, 'touchend');
		}
		var clientPosition: Position = {
			clientX: event.changedTouches[0].clientX,
			clientY: event.changedTouches[0].clientY,
		};
		this.moveLoadedImage(clientPosition);
	}

	moveLoadedImageDrag(event: MouseEvent) {
		event.preventDefault();
		if (!this.inDragEvent) {
			return;
		}
		var clientPosition: Position = {
			clientX: event.clientX,
			clientY: event.clientY,
		};
		this.moveLoadedImage(clientPosition);
	}

	moveLoadedImage(clientPosition: Position) {
		var newLeft: number = this.imageStyleLeft + (clientPosition.clientX - this.lastPosition.clientX);
		var newTop: number = this.imageStyleTop + (clientPosition.clientY - this.lastPosition.clientY);
		var maskHeight: number = this.masImagekElement.nativeElement.offsetHeight;
		var maskWidth: number = this.masImagekElement.nativeElement.offsetWidth;
		var displayedImageHeight: number = this.loadedImageElement.nativeElement.clientHeight;
		var displayedImageWidth: number = this.loadedImageElement.nativeElement.clientWidth;
		if (newTop < 0 || newLeft < 0) {
			return;
		}
		if (newTop + displayedImageHeight > maskHeight || newLeft + displayedImageWidth > maskWidth) {
			return;
		}
		this.imageStyleTop = newTop;
		this.imageStyleLeft = newLeft;
		/* 		if (!(newTop > 0 || newTop < (displayedImageHeight - maskHeight) * -1)) {
		}
		if (!(newLeft > 0 || newLeft < (displayedImageWidth - maskWidth) * -1)) {
		} */
		this.lastPosition = clientPosition;
		this.drawCanvas();
	}

	endMoveLoadedImageTouch(event: TouchEvent) {
		this.inDragEvent = false;
	}

	endMoveLoadedImageDrag(event: MouseEvent) {
		this.inDragEvent = false;
	}

	triggerEvent(el, type) {
		// IE9+ and other modern browsers
		if ('createEvent' in document) {
			var e = document.createEvent('HTMLEvents');
			e.initEvent(type, false, true);
			el.dispatchEvent(e);
		}
	}

	convertToBase64(file: File): Promise<string> {
		return new Promise((res, rej) => {
			const fileReader = new FileReader();
			fileReader.readAsDataURL(file);
			fileReader.onload = () => {
				res(String(fileReader.result));
			};
			fileReader.onerror = (error) => {
				rej(error);
			};
		});
	}

	drawCanvas() {
		const ratio = Math.ceil(window.devicePixelRatio);
		const canvas = document.createElement('canvas');
		var maskHeight: number = this.masImagekElement.nativeElement.offsetHeight;
		var maskWidth: number = this.masImagekElement.nativeElement.offsetWidth;
		var displayedImageHeight: number = this.loadedImageElement.nativeElement.clientHeight;
		var displayedImageWidth: number = this.loadedImageElement.nativeElement.clientWidth;
		canvas.height = maskHeight * ratio;
		canvas.width = maskWidth * ratio;
		canvas.style.width = `${maskWidth}px`;
		canvas.style.height = `${maskHeight}px`;
		canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(this.loadedImageElement.nativeElement, this.imageStyleLeft, this.imageStyleTop, displayedImageWidth, displayedImageHeight);
		this.croppedImageCanvas = canvas;
	}

	private _convertToCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
		return new Promise<Blob>((res, rej) => {
			canvas.toBlob(
				(blob: Blob) => {
					if (blob == null) {
						alert('Something went wrong when preparing your image to be uploaded.');
						return;
					}
					res(blob);
				},
				'image/png',
				0.8
			);
		});
	}
}

export async function checkImageAspectRatio(imageBase64: string, aspectRation: AspectRatio): Promise<boolean> {
	var desiredWidth = aspectRation.width;
	var desiredHeight = aspectRation.height;
	const desiredAspectRatio: number = parseFloat((desiredWidth / desiredHeight).toFixed(2));
	var imageSize = await getImageSize(imageBase64);
	var imageAspectRatio: number = parseFloat((imageSize.width / imageSize.height).toFixed(2));
	if (imageAspectRatio == desiredAspectRatio) {
		return true;
	}
	return false;
}

export async function getImageSize(imageBase64: string): Promise<ImageSize> {
	return new Promise<ImageSize>((res, rej) => {
		const image: HTMLImageElement = new Image();
		image.src = imageBase64;
		image.onload = (rs: Event) => {
			var imageSize: ImageSize = {
				height: Number(rs.currentTarget['height']),
				width: Number(rs.currentTarget['width']),
			};
			res(imageSize);
		};
		image.onerror = (error) => {
			rej(error);
		};
	});
}

export interface AspectRatio {
	width: number;
	height: number;
}

interface Position {
	clientX: number;
	clientY: number;
}

interface ImageSize {
	height: number;
	width: number;
}
