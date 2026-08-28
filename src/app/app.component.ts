import { inject, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthStore } from './core/store/auth/auth.store';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((e: NavigationEnd) => {
        window.parent.postMessage({ type: 'preview-route-changed', route: e.urlAfterRedirects }, '*');
      });
  }

  async ngOnInit() {
    window.parent.postMessage({ type: 'angular-ready' }, '*');
    this.authStore.loadAuth();
  }
}