import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-date-input',
  templateUrl: './custom-date-input.component.html',
  styleUrls: ['./custom-date-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDateInputComponent),
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
export class CustomDateInputComponent implements ControlValueAccessor {

  @Input() id: string = '';
  @Input() titulo: string = '';
  @Input() tabIndex: number;
  @Input() minDate: string;
  @Input() maxDate: string; 
  @Input() vazio: boolean;
  @Input() disabledGroup: boolean;

  private innerValue: any;

  @ViewChild('input') input: ElementRef;

  public acionaFoco() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 100);
  }

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
