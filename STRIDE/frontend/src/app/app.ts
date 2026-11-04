import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroCollageComponent } from './components/hero-collage/hero-collage.component';
import { ProductGridComponent } from './components/product-grid/product-grid.component';
import { RotationBuilderComponent } from './components/rotation-builder/rotation-builder.component';
import { CompareDrawerComponent } from './components/compare-drawer/compare-drawer.component';
import { CartOrdersDrawerComponent } from './components/cart-orders-drawer/cart-orders-drawer.component';
import { AiConciergeComponent } from './components/ai-concierge/ai-concierge.component';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroCollageComponent,
    ProductGridComponent,
    RotationBuilderComponent,
    CompareDrawerComponent,
    CartOrdersDrawerComponent,
    AiConciergeComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  store = inject(StoreService);
}
