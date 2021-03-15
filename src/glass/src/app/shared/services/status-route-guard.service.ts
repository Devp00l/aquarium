import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Status, StatusService, StatusStageEnum } from '~/app/shared/services/api/status.service';

@Injectable({
  providedIn: 'root'
})
export class StatusRouteGuardService implements CanActivate, CanActivateChild {
  constructor(private router: Router, private statusService: StatusService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.statusService.status().pipe(
      catchError((err) => {
        // Do not show an error notification.
        if (_.isFunction(err.preventDefault)) {
          err.preventDefault();
        }
        const res: Status = {
          /* eslint-disable @typescript-eslint/naming-convention */
          node_stage: StatusStageEnum.unknown
        };
        return of(res);
      }),
      map((res: Status): boolean | UrlTree => {
        const url = this.isUrlChangeNeeded(res.node_stage, state.url);
        return url ? this.router.parseUrl(url) : true;
      })
    );
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }

  private isUrlChangeNeeded(stage: number, currentUrl: string): string | undefined {
    if (stage === StatusStageEnum.none && !currentUrl.startsWith('/installer')) {
      return '/installer';
    } else if (stage === StatusStageEnum.bootstrapping) {
      const url = '/installer/create/bootstrap';
      if (url !== currentUrl) {
        return url;
      }
    } else if (stage === StatusStageEnum.bootstrapped) {
      const urls = ['/installer/create/deployment', '/dashboard'];
      if (!urls.includes(currentUrl)) {
        return urls[0];
      }
    } else if (stage === StatusStageEnum.ready && currentUrl !== '/dashboard') {
      return '/dashboard';
    }
    return undefined;
  }
}
