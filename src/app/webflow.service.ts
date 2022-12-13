import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WebflowService {

  constructor(private http: HttpClient) { }

  getAccounts() {
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}`,
    // });
    // return this.http.get(
    //   'https://mindful-narwhal-6i6s53-dev-ed.lightning.force.com/services/data/v56.0/query', 
    //   { 
    //     headers: headers, 
    //     params: new HttpParams().set('q', 'SELECT FIELDS(All) FROM Account LIMIT 200') 
    //   });
    return this.http.get('/accounts');
  }
}
