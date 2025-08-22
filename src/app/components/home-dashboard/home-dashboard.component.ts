import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService, GoogleUser } from '../../services/auth.service';

@Component({
  selector: 'app-home-dashboard',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ProgressSpinnerModule
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css'
})
export class HomeDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  router = inject(Router); // Make router public for template access

  user: GoogleUser | null = null;
  isAuthenticated = false;
  isLoading = true;

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!user;
      this.isLoading = false;
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
