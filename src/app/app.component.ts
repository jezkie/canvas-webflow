import { Component } from '@angular/core';
import { WebflowService } from './webflow.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private svc: WebflowService) {

  }
  title = 'canvas-webflow';

  ngOnInit() {
    this.svc.getAccounts().subscribe(accts => {
      console.log('Accounts in UI', accts);
      
    });
  }
}
