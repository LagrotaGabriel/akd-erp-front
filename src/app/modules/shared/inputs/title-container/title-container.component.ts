import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-container',
  templateUrl: './title-container.component.html',
  styleUrls: ['./title-container.component.scss']
})
export class TitleContainerComponent {
  @Input() titulo: string;
  @Input() descricao: string;
}
