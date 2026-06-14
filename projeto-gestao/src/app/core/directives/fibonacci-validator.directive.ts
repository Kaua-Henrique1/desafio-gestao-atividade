import {Directive} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appFibonacciValidator]',
  standalone: true,
  providers: [
    { provide: NG_VALIDATORS, useExisting: FibonacciValidatorDirective, multi: true }
  ]
})
export class FibonacciValidatorDirective implements Validator {
  private allowed = [1, 2, 3, 5, 8, 13];

  validate(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    if (isNaN(num)) return { invalidFibonacci: true };
    if (!this.allowed.includes(num)) return { invalidFibonacci: true };
    return null;
  }

  registerOnValidatorChange?(fn: () => void): void {
    // noop
  }
}

