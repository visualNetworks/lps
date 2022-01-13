import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { retry } from 'rxjs/operators';
import { Question, QuestionRAW, QuestionPool, Answer, Modus, examValue } from './dateninterfaces';
import { formatDateninterfaces } from './format-dateninterfaces';
@Injectable({
  providedIn: 'root'
})

export class DatabaseMysqlService {

  protected apiRoot: String = "https://api.visualnetworks.eu/lps";
  private modus?: Modus;
  private exam?: examValue;

  constructor(
    private apiClient: HttpClient,
    ) { }

  APIgetPools(): Observable<QuestionPool[]> {
    return this.apiClient.get<QuestionPool[]>(`${this.apiRoot}/getPools`);
  }

  APIgetPoolByURIName(uri: String): Observable<QuestionPool> {
    let requestURI = encodeURI(`${this.apiRoot}/getPoolByURIName?poolURIName=${uri}`);
    return this.apiClient.get<QuestionPool>(requestURI);
  }

  APIgetQuestionsByPoolId(id: Number): Observable<Question[]> {
    return this.apiClient.get<QuestionRAW[]>(`${this.apiRoot}/getQuestionsByPoolId?poolId=${id}`).pipe(
      retry(3),
      map(questionRAW => questionRAW.map(question => formatDateninterfaces.formatQuestion(question))),
      );
  }

  APIgetQuestionById(id: Number): Observable<Question> {
    return this.apiClient.get<QuestionRAW>(`${this.apiRoot}/getQuestionById?id=${id}`).pipe(
      retry(3),
      map(question => formatDateninterfaces.formatQuestion(question)),
    );
  }

  APIgetAnswerById(id: Number): Observable<Answer> {
    return this.apiClient.get<Answer>(`${this.apiRoot}/getAnswerById?id=${id}`);
  }

  APIgetPruefungsQuestionsByPoolId(id: Number, questionSize: Number): Observable<Question[]> {
    return this.apiClient.get<QuestionRAW[]>(`${this.apiRoot}/getPruefungsQuestionsByPoolId.php?poolId=${id}&questionSize=${questionSize}`).pipe(
    retry(3),
    map(questionRAW => questionRAW.map(question => formatDateninterfaces.formatQuestion(question))),
    );
  }

  // Getter sowie Setter für den Modus.
  setMode(modeObj: Modus) {
    this.modus = modeObj;
  }

  getMode(): Modus {
    return this.modus || {mode: ''};
  }

  // Getter sowie Setter für die Prüfungssimulation.
  setExamValue(modeObj: examValue) {
    this.exam = modeObj;
  }

  getExamValue(): examValue {
    return this.exam || {};
  }

}
