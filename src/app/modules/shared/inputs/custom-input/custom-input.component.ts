import { Component, ElementRef, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { fadeInOutAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ],
  animations: [ fadeInOutAnimation ]
})
export class CustomInputComponent implements ControlValueAccessor {

  @Input() id: string = '';
  @Input() valido: boolean;
  @Input() titulo: string = '';
  @Input() tabIndex: number;
  @Input() maxLength: number;
  @Input() todosCaracteresMaiusculos: boolean;
  @Input() touched: boolean;
  @Input() mensagemErro: string;
  @Input() customIcon: string;
  @Input() disabledGroup: boolean;
  @Input() dataList: string[];

  private innerValue: any;

  @ViewChild('input') input: ElementRef;

  public acionaFoco() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 100);
  }

  public iconeAparente(): boolean {
    if (!this.disabledGroup) {
      if (this.customIcon != null) return true;
      if (!this.valido) return true;
      else if (this.valido && this.value != null && this.value != '') return true;
      else return false;
    }
    else return false;
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

  geraNomeIcone(): string {
    if (this.customIcon != null && this.customIcon != '') {
      if (this.value == '' && this.valido || this.value == null && this.valido) return this.customIcon;
      else if (this.value != '' && this.valido && this.value != null) return 'check';
      else return 'error';
    }
    else {
      if (this.valido) return 'check';
      else return 'error';
    }
  }

}
