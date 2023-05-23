import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fadeInOutAnimation } from 'src/app/shared/animations';

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
  animations: [fadeInOutAnimation]
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
