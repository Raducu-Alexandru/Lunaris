import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class FullscreenComponentService {
  openType: FullscreenComponentTypes = null;
  openId: string = '';
  componentInputsDict: FullscreenComponentInputs = {};
  fullscreenComponentSubject: Subject<FullscreenComponentSubjectPayload> = new Subject<FullscreenComponentSubjectPayload>();
  resultSuject: Subject<FullscreenComponentEventResultSubjectPayload> = new Subject<FullscreenComponentEventResultSubjectPayload>();

  constructor() { }

  open(openType: FullscreenComponentTypes, componentInputsDict: FullscreenComponentInputs): string {
    this.openType = openType;
    this.openId = uuidv4();
    this.componentInputsDict = componentInputsDict;
    this._emitFullscreenComponentSubject();
    return this.openId;
  }

  emitEvent(obj: FullscreenComponentEventResult): void {
    var eventResultObject: FullscreenComponentEventResultSubjectPayload = {
      id: this.openId,
      closed: obj.closed,
      result: obj.result,
    };
    this.resultSuject.next(eventResultObject);
    this.openType = null;
    this._emitFullscreenComponentSubject();
  }

  private _emitFullscreenComponentSubject(): void {
    this.fullscreenComponentSubject.next({
      type: this.openType,
      inputs: this.componentInputsDict,
    });
  }
}

export type FullscreenComponentInputs = { [key: string]: any };

export type FullscreenComponentTypes = 'edit-photo';

export interface FullscreenComponentSubjectPayload {
  type: FullscreenComponentTypes;
  inputs: FullscreenComponentInputs;
}

export interface FullscreenComponentEventResult {
  closed: boolean;
  result: any;
}

export interface FullscreenComponentEventResultSubjectPayload {
  id: string;
  closed: boolean;
  result: any;
}
