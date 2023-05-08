import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-title-container',
  templateUrl: './custom-title-container.component.html',
  styleUrls: ['./custom-title-container.component.scss']
})
export class CustomTitleContainerComponent {

  @Input() titulo: string;
  @Input() descricao: string;

}
