import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'glass-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnDestroy {
  breadcrumbs: IBreadcrumb[] = [];
  /**
   * Useful for e2e tests.
   * This allow us to mark the breadcrumb as pending during the navigation from
   * one page to another.
   * This resolves the problem of validating the breadcrumb of a new page and
   * still get the value from the previous
   */
  finished = false;
  subscription: Subscription;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    this.subscription = this.router.events
      .pipe(
        filter((x) => x instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private buildBreadCrumb(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: IBreadcrumb[] = []
  ): IBreadcrumb[] {
    let label = route.routeConfig?.data?.breadcrumb || '';
    let path: string = route.routeConfig?.data ? (route.routeConfig.path as string) : '';

    // If the route is dynamic route such as ':id', remove it
    const lastRoutePart = path.split('/').pop() || '';
    if (lastRoutePart.startsWith(':') && !!route.snapshot) {
      const paramName = lastRoutePart.split(':')[1];
      path = path.replace(lastRoutePart, route.snapshot.params[paramName]);
      label = route.snapshot.params[paramName];
    }

    const nextUrl = path ? `${url}/${path}` : url;
    const breadcrumb: IBreadcrumb = {
      label,
      path: nextUrl
    };
    const newBreadcrumbs = breadcrumb.label ? [...breadcrumbs, breadcrumb] : [...breadcrumbs];
    if (route.firstChild) {
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }
}

export interface IBreadcrumb {
  label: string;
  path: string | null;
}
