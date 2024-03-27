import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnnouncementInfo } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
  selector: 'app-channel-message',
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss'
})
export class ChannelMessageComponent {
  @Input('data') data: AnnouncementInfo = {
    announcementId: null,
    announcementName: '',
    announcementText: ''
  };
  @Input('show-delete-options') showDeleteOptions: boolean = false;
  @Output('delete') emitDelete: EventEmitter<number> = new EventEmitter();

  onDeleteClick(): void {
    this.emitDelete.emit(this.data.announcementId);
  }
}
