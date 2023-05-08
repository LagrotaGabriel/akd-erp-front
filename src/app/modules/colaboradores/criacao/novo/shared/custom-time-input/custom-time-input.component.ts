import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-time-input',
  templateUrl: './custom-time-input.component.html',
  styleUrls: ['./custom-time-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTimeInputComponent),
      multi: true
    }
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class CustomTimeInputComponent implements ControlValueAccessor {

  @Input() id: string = '';
  @Input() valido: boolean;
  @Input() titulo: string = '';
  @Input() tabIndex: number;
  @Input() mensagemErro: string;
  @Input() disabledGroup: boolean;

  private innerValue: any;

  get value() {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCb(v);
    }
  }

  onChangeCb: (_: any) => void = () => { };
  onTouchCb: (_: any) => void = () => { };

  registerOnChange(fn: any): void {
    this.onChangeCb = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchCb = fn;
  }

  writeValue(v: any) {
    this.value = v;
  }

}
