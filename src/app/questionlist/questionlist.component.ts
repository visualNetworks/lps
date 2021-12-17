import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseMysqlService } from '../database-mysql.service';
import { Modus, Question, QuestionPool } from '../dateninterfaces';

@Component({
  selector: 'lps-questionlist',
  templateUrl: './questionlist.component.html',
  styleUrls: ['./questionlist.component.css']
})
export class QuestionlistComponent implements OnInit {

  questions: Question[] = [];
  questionPool?: QuestionPool;
  poolURIName = String(this.route.snapshot.paramMap.get("poolURIName"));
  questionURIid = Number(this.route.snapshot.paramMap.get("questionId"));
  modus?: Modus;

  constructor(
    private db: DatabaseMysqlService,
    private route: ActivatedRoute,
    ) {
      this.modus = this.db.getMode();
    }

  ngOnInit(): void {

    this.db.getPoolByURIName(this.poolURIName).subscribe(res => {
      this.questionPool = res;
      this.db.getQuestionsByPoolId(res.id || 0).subscribe(res => this.questions = res);
    } );

  }

}
