import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FibonacciValidatorDirective } from './fibonacci-validator.directive';
@Component({
  selector: 'app-test',
  template: '<input type="number" [formControl]="ctrl" appFibonacciValidator />',
  standalone: true,
  imports: [ReactiveFormsModule, FibonacciValidatorDirective]
})
class TestComponent {
  ctrl = new FormControl();
}
describe('FibonacciValidatorDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let input: DebugElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, ReactiveFormsModule, FibonacciValidatorDirective]
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    input = fixture.debugElement.query(By.css('input'));
    fixture.detectChanges();
  });
  it('should create an instance', () => {
    const directive = new FibonacciValidatorDirective();
    expect(directive).toBeTruthy();
  });
  describe('Valid Fibonacci Values', () => {
    it('should accept 1 as valid', () => {
      component.ctrl.setValue(1);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
      expect(component.ctrl.valid).toBe(true);
    });
    it('should accept 2 as valid', () => {
      component.ctrl.setValue(2);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
      expect(component.ctrl.valid).toBe(true);
    });
    it('should accept 3 as valid', () => {
      component.ctrl.setValue(3);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
      expect(component.ctrl.valid).toBe(true);
    });
    it('should accept 5 as valid', () => {
      component.ctrl.setValue(5);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
      expect(component.ctrl.valid).toBe(true);
    });
    it('should accept 8 as valid', () => {
      component.ctrl.setValue(8);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
      expect(component.ctrl.valid).toBe(true);
    });
    it('should accept 13 as valid', () => {
      component.ctrl.setValue(13);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
      expect(component.ctrl.valid).toBe(true);
    });
  });
  describe('Invalid Fibonacci Values', () => {
    it('should reject 4', () => {
      component.ctrl.setValue(4);
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
      expect(component.ctrl.valid).toBe(false);
    });
    it('should reject 6', () => {
      component.ctrl.setValue(6);
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
    });
    it('should reject 10', () => {
      component.ctrl.setValue(10);
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
    });
    it('should reject 0', () => {
      component.ctrl.setValue(0);
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
    });
    it('should reject negative numbers', () => {
      component.ctrl.setValue(-5);
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
    });
    it('should reject values > 13', () => {
      component.ctrl.setValue(21);
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
    });
  });
  describe('Edge Cases', () => {
    it('should be valid when control is empty', () => {
      component.ctrl.setValue(null);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
    });
    it('should be valid when control is undefined', () => {
      component.ctrl.setValue(undefined);
      expect(component.ctrl.getError('invalidFibonacci')).toBeNull();
    });
    it('should reject non-numeric strings', () => {
      component.ctrl.setValue('abc');
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
    });
    it('should handle decimal/float values', () => {
      component.ctrl.setValue(2.5);
      expect(component.ctrl.getError('invalidFibonacci')).toBeTruthy();
    });
  });
});
