import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService, GoogleUser } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home-dashboard',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ProgressSpinnerModule,
    ToolbarModule
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css'
})
export class HomeDashboardComponent implements OnInit {
  user: GoogleUser | null = null;
  isAuthenticated = false;
  isLoading = true;
  isDarkMode = false;

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
    public router: Router
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!user;
      this.isLoading = false;
    });

    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
