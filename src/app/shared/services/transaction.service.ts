import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  createTransaction(transaction: any) {
    return this.http.post(`${environment.api}/transaccion`, transaction, {
      withCredentials: true,
    });
  }
}
