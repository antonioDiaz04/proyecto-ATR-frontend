import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BaseHttpService } from '../../../../shared/services/base-http.service';

@Injectable({
  providedIn: 'root',
})
export class SignUpService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  signUp(data: any): Observable<any> {
    const url = `${environment.api}/usuarios/singUp`;
    return this.post(url, data);
  }
}
