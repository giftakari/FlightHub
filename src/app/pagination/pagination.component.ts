import { Component } from '@angular/core';
import {imageUrl} from "../image-url";

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  itemsPerPage = 10; // Number of items per page
  currentPage = 0;  // Current page
  totalItems = 100; // Total number of items

  // Calculate the total number of pages
  totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

  imageUrls=imageUrl

  // Generate an array of page numbers
  //pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }


}
