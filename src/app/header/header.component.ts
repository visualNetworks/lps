import { Component, OnInit, AfterViewInit} from '@angular/core';
import { NavigationEnd, Event, Router, NavigationStart } from '@angular/router';
import { DatabaseMysqlService } from '../database-mysql.service';
import { examValue, examTimer, Modus } from '../dateninterfaces';
import { Observable } from 'rxjs';

@Component({
  selector: 'lps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, AfterViewInit {
  modus?: Modus;
  pause: Boolean = false;
  timerTick?: examTimer;
  exam: examValue = {};
  examProgress: number = 0;
  progressBarWidth: Number = 0;

  examObserver: Observable<examValue> = new Observable(observer => {
    setInterval(() => {
    observer.next(this.db.getExamValue());
    observer.complete();
    },150);
});

  constructor(
    public router: Router,
    private db: DatabaseMysqlService,
    ) {
      this.modus = this.db.getMode();
    }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.router.events.subscribe((event: Event) => {

      if (event instanceof NavigationEnd || event instanceof NavigationStart) {

        if (this.router.url.includes('/pruefung')) {

          this.examObserver.subscribe(examValues => {
            this.exam = examValues;

            this.exam.exit ? this.examProgress = 0 : false;

            if (this.exam.examStarted) {
              this.timerTick = this.db.getExamTicker();

              if (!this.timerTick.tick) {
                setTimeout(() => {
                  let display = document.querySelector('#zeit');
                  this.startTimer(this.exam?.examTimer, display);
                  this.db.setExamTicker({ tick: true });
                }, 50);
              }
              if (this.exam.examQuestions !== undefined && this.exam.examProgress !== undefined) {
                this.examProgress = Math.round((this.exam.examProgress * 100) / this.exam.examQuestions);
                this.db.setExamValue({ ...this.exam, examProgressPercent: this.examProgress, showProgress: true });
              }

              this.examProgress >= 100 ? this.progressBarWidth = 74 : this.progressBarWidth = 50;

            }
          });
        }
      }
    });
  }

  machePause(pause: Boolean) {
    pause ? this.pause = true : this.pause = false;
  }

  cancelExam(whoCancelled: Number) {
    let code: Number = 0;
    switch(whoCancelled) {
      case 1:
        code = 100;
        break;
      case 2:
        code = 200;
        break;
      case 3:
        code = 300;
        break;
    }
    this.exam = { ...this.exam, examStarted: false, examFailed: true, examDone: false, examReasons: code, exit: false };
    this.db.setExamValue(this.exam);
  }

  exitExam() {
    this.db.exitExam();
  }

startTimer(duration: any, display: any) {
    let timer = duration, minutes, seconds;
    let timereinheit = document.getElementById('timereinheit');

    let timefunc = setInterval(() => {

      if(this.exam?.exit) {  this.timerTick = { tick: false}; this.db.setExamTicker(this.timerTick); clearInterval(timefunc); }

      if(!this.pause && !this.exam?.exit) { --timer; }

        minutes = timer / 60;
        seconds = timer % 60;

        minutes = parseInt(minutes.toString(), 10);
        seconds = parseInt(seconds.toString(), 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;


        if(timer < 11 && timer > 5 && !timereinheit?.classList.contains('ten-seconds-warning')) { timereinheit?.classList.add('ten-seconds-warning'); }
        if(timer < 6 &&  !timereinheit?.classList.contains('five-seconds-warning')) { timereinheit?.classList.remove('ten-seconds-warning'); timereinheit?.classList.add('five-seconds-warning'); }

        // Verhindert, dass der Nutzer "Weitermachen" kann...
        // (Somit wird verhindert, wenn man trotzdem eine frage weitergeht,
        // dass der Timer umgangen wird. WASaBUG!!)
        if (timer <= -1)
        {
          clearInterval(timefunc);
          this.progressBarWidth = 74;
        }

        if (timer < 0) {
            timereinheit?.classList.remove('five-seconds-warning');
            timereinheit?.classList.add('ten-seconds-warning');
            timer = -1,0,0; // Siehe oben..
            this.cancelExam(1);
            minutes = "00";
            seconds = "00";
        }

        if(timer > 0 && this.exam?.examFailed)
        {
          this.cancelExam(2);
          timereinheit?.classList.remove('five-seconds-warning');
          timereinheit?.classList.add('just-red');
          this.progressBarWidth = 74;
          clearInterval(timefunc);
          minutes = "00";
          seconds = "00";
        }

        if(this.exam?.examDone)
        {
          timereinheit?.classList.remove('five-seconds-warning');
          timereinheit?.classList.remove('ten-seconds-warning');
          timereinheit?.classList.add('just-green');
          clearInterval(timefunc);
        }

        display ? display.textContent = minutes + ":" + seconds : false;


    }, 1000);
}

}
