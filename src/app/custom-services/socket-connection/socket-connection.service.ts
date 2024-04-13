import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Injectable({
  providedIn: 'root',
})
export class SocketConnectionService {
  onSocketChangeStateSubject: Subject<boolean> = new Subject<boolean>();
  isSocketConnected: boolean = false;

  constructor(private _socketService: SocketService) {}

  async connectSocket(): Promise<void> {
    await this._socketService.connectSocket();
    this.isSocketConnected = true;
    this.onSocketChangeStateSubject.next(this.isSocketConnected);
  }

  async disconnectSocket(): Promise<void> {
    await this._socketService.disconnectSocket();
    this.isSocketConnected = false;
    this.onSocketChangeStateSubject.next(this.isSocketConnected);
  }

  getSocketState(): boolean {
    return this.isSocketConnected;
  }
}
