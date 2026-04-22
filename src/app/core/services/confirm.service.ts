import { ApplicationRef, createComponent, EnvironmentInjector, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  confirm(message: string, title: string = 'تأكيد'): Observable<boolean> {
    const result$ = new Subject<boolean>();

    const ref = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.injector,
    });

    ref.instance.title = title;
    ref.instance.message = message;

    ref.instance.confirmed.subscribe((value: boolean) => {
      result$.next(value);
      result$.complete();
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    });

    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement);

    return result$.asObservable();
  }
}
