import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-attribut',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './attribut.component.html',
  styleUrl: './attribut.component.scss'
})
export class AttributComponent implements OnInit {

  matAttribForm!: FormGroup;
  noteControl = new FormControl(0); // valeur par défaut
  ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];        // graduations

  ponderation = [
    {
      critere: "Ressource opérationelles disponibles",
      attribut: "Équipements et installations disponibles pour maintenir les opérations",
      children: [
        {
          plage: "0",
          label: "L'entreprise n'a pas d'installations, ses processus sont réalisés de manière non professionnelle."
        },
        {
          plage: "5",
          label: "Bien que l'entreprise ait des équipements de base pour ses processus, les installations sont insuffisantes et inappropriées pour ses opérations."
        },
        {
          plage: "7",
          label: "L'entreprise dispose d'installations avec des équipements de base pour ses services de production/vente."
        },
        {
          plage: "10",
          label: "L'entreprise dispose d'une usine/bureau, d'équipements professionnels et de technologies pour la production et la vente ; équipements de transport et de logistique."
        },
      ]
    },
    {
      critere: "Ressource opérationelles disponibles",
      attribut: "Nombre d'employés",
      children: [
        {
          plage: "0",
          label: "L'entreprise a moins de 3 employés"
        },
        {
          plage: "5",
          label: "L'entreprise a entre 5 et 3 employés"
        },
        {
          plage: "7",
          label: "L'entreprise a entre 10 et 5 employés"
        },
        {
          plage: "10",
          label: "L'entreprise a plus de 10 employés"
        },
      ]
    },
    {
      critere: "Ressource opérationelles disponibles",
      attribut: "Disponibilité des fond personnels pour l'opération",
      children: [
        {
          plage: "0",
          label: "L'entreprise a de graves problèmes de fonds de roulement."
        },
        {
          plage: "7",
          label: "L'entreprise a des fonds, mais pas suffisamment pour couvrir les dépenses d'exploitation."
        },
        {
          plage: "10",
          label: "L'entreprise a des fonds propres pour l'investissement et/ou le réinvestissement."
        },
      ]
    },

    {
      critere: "Compétences techniques",
      attribut: "Gestion d'entreprise",
      children: [
        {
          plage: "0",
          label: "Le propriétaire de l'entreprise n'a pas de diplôme professionnel et n'a pas suivi de formation technique spécialisée."
        },
        {
          plage: "5",
          label: "Le propriétaire de l'entreprise a étudié dans des domaines différents de son entreprise ; il n'a pas reçu de formation technique spécialisée."
        },
        {
          plage: "7",
          label: "Le propriétaire de l'entreprise possède un baccalauréat dans des domaines liés aux affaires, mais n'a pas suivi de formation technique spécialisée."
        },
        {
          plage: "10",
          label: "Le propriétaire de l'entreprise possède un master dans des domaines liés aux affaires et a suivi une formation technique spécialisée."
        },
      ]
    },
    {
      critere: "Compétences techniques",
      attribut: "Expérience technique",
      children: [
        {
          plage: "0",
          label: "Le propriétaire n'a pas reçu de formation technique spécialisée et ne possède aucun diplôme technique."
        },
        {
          plage: "5",
          label: "Le propriétaire n'a pas reçu de formation technique spécialisée, mais a travaillé dans d'autres entreprises du même secteur sans avoir de diplôme technique."
        },
        {
          plage: "7",
          label: "Le propriétaire a suivi une formation technique spécialisée, mais ne possède pas de diplôme technique."
        },
        {
          plage: "10",
          label: "Le propriétaire a suivi une formation technique spécialisée et possède un diplôme technique."
        },
      ]
    },
    {
      critere: "Compétences techniques",
      attribut: "Expérience dans le métier",
      children: [
        {
          plage: "0",
          label: "Moins de 1 an d'expérience dans le métier"
        },
        {
          plage: "5",
          label: "Expérience entre 1 et 5 ans"
        },
        {
          plage: "7",
          label: "Expérience entre 5 et 10 ans"
        },
        {
          plage: "10",
          label: "Expérience dans le métier, plus de 10 ans"
        },
      ]
    },
  ]

  currentIndex: number = 0; //  index de l'attribut affiché
  visited = new Set<number>();


  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.matAttribForm = this.formBuilder.group({
      note_1: [0],
      comment_1: [null],
      note_2: [0],
      comment_2: [null],
      note_3: [0],
      comment_3: [null],
      note_4: [0],
      comment_4: [null],
      note_5: [0],
      comment_5: [null],
      note_6: [0],
      comment_6: [null],
    });
  }

  // 🔹 Navigation
  nextItem(): void {
    if (this.currentIndex < this.ponderation.length - 1) {
      this.currentIndex++;
    }
  }

  previousItem(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Optionnel : méthode pour aller à un élément spécifique
  goToItem(index: number): void {
    if (index >= 0 && index < this.ponderation.length) {
      this.currentIndex = index;
    }
  }


    logAll() {
    console.log(this.matAttribForm.value);
  }

}
