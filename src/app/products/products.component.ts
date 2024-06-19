import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  @Input() phone =""
  @Input() price : number=0;
  @Input() description =""

}
