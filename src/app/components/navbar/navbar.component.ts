import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <div class="brand">
          <div class="brand-logo">🏛️</div>
          <div>
            <div class="brand-name">Banco Hexagonal</div>
            <div class="brand-tag">Spring Boot 4 • AWS Cloud</div>
          </div>
        </div>

        <nav class="nav-links">
          <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
            <span>👥</span> Clientes
          </a>
          <a routerLink="/cuentas" routerLinkActive="active" class="nav-item">
            <span>💳</span> Cuentas
          </a>
          <a routerLink="/transacciones" routerLinkActive="active" class="nav-item">
            <span>💸</span> Transacciones
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background-color: #0b1120;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      font-size: 1.8rem;
    }
    .brand-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .brand-tag {
      font-size: 0.72rem;
      color: var(--accent-blue);
      font-weight: 500;
    }
    .nav-links {
      display: flex;
      gap: 8px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-item:hover {
      color: var(--text-primary);
      background-color: rgba(255, 255, 255, 0.05);
    }
    .nav-item.active {
      color: #fff;
      background: linear-gradient(135deg, var(--accent-indigo), #4f46e5);
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
    }
    @media (max-width: 640px) {
      .nav-container { height: auto; padding: 12px 16px; flex-direction: column; gap: 12px; }
    }
  `]
})
export class NavbarComponent {}
