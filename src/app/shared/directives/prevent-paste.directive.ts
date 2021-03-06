import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appBlockPaste]'
})
export class PreventPasteDirective {
  constructor() { }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
      console.log('pasting...');
    e.preventDefault();
  }
}