import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

const INITIAL_ATTENDEES = 3;

@Component({
  selector: 'app-t1b',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
],
  templateUrl: './t1b.component.html',
  styleUrl: './t1b.component.scss'
})
export class T1bComponent implements OnInit {

  toolName!:string;
  MeetForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: object,
  ){}

  ngOnInit(): void {
        this.toolName = this.route.snapshot.queryParams['toolName'];

        this.MeetForm = this.formBuilder.group({
          etape: [null],
          date: [null],
          lieu: [null],
          objectif: [null],
          ordre: [null],
          resultats: [null],
          remarque: [null],
          presents: this.formBuilder.array([])
        });

        for (let i = 0; i < INITIAL_ATTENDEES; i++) this.addAttendee(false);
  }

  // ── Fiche de présence ───────────────────────────────────────────────────────

  get presents(): FormArray {
    return this.MeetForm.get('presents') as FormArray;
  }

  addAttendee(focus = true): void {
    this.presents.push(this.formBuilder.group({ nom: [null], contact: [null] }));
    if (focus && isPlatformBrowser(this.platformId)) {
      const index = this.presents.length - 1;
      setTimeout(() => {
        const el = document.getElementById('present-nom-' + index) as HTMLInputElement | null;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus({ preventScroll: true });
      }, 50);
    }
  }

  removeAttendee(index: number): void {
    this.presents.removeAt(index);
    if (this.presents.length === 0) this.addAttendee(false);
  }

  goBack(): void {
    history.back();
  }

}
