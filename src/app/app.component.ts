


import { Component } from '@angular/core';
import {imageUrl} from "./image-url";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'relearn-angular';
   allItems = [
    { id: 1, phone: "iPhone 13", price: 799, description: "The latest iPhone model" },
    { id: 2, phone: "Samsung Galaxy S21", price: 699, description: "Flagship Android smartphone" },
    { id: 3, phone: "Google Pixel 6", price: 699, description: "Google's smartphone with a great camera" },
    { id: 4, phone: "OnePlus 9 Pro", price: 899, description: "High-performance OnePlus device" },
    { id: 5, phone: "Xiaomi Mi 11", price: 599, description: "Budget-friendly Xiaomi phone" },
    { id: 6, phone: "Sony Xperia 5 III", price: 799, description: "Sony's flagship Xperia" },
    { id: 7, phone: "LG V60 ThinQ", price: 599, description: "Former LG flagship phone" },
    { id: 8, phone: "Motorola Moto G Power", price: 249, description: "Affordable Motorola device" },
    { id: 9, phone: "Nokia 8.3", price: 399, description: "Nokia's 5G-capable phone" },
    { id: 10, phone: "Asus ROG Phone 6", price: 999, description: "Gaming-oriented Asus device" },
    // Add more phones here
  ];
   imageUrls=imageUrl

}
