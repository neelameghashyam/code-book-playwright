import { Component, ChangeDetectorRef, ViewChild, NgZone, Inject } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

// Dialog Component
@Component({
  selector: 'app-dialog-content',
  template: `
    <h1 mat-dialog-title>Support Dialog</h1>
    <div mat-dialog-content>
      <p>Contact our support team for assistance.</p>
      <mat-form-field appearance="fill">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="data.name">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button [mat-dialog-close]="data">Submit</button>
    </div>
  `,
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule]
})
export class DialogContentComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

interface User {
  id: number;
  name: string;
  role: string;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatGridListModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatStepperModule,
    MatToolbarModule,
    MatTreeModule,
    FormsModule
  ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent {
  skills: string[] = ['Angular', 'TypeScript'];
  selectedFruit: string = '';
  fruits: string[] = ['Apple', 'Banana', 'Orange', 'Mango', 'Strawberry'];
  filteredFruits: string[] = [];
  progress: number = 50;
  displayedColumns: string[] = ['id', 'name', 'role'];
  dataSource = new MatTableDataSource<User>([
    { id: 1, name: 'John Doe', role: 'Developer' },
    { id: 2, name: 'Jane Smith', role: 'Designer' },
    { id: 3, name: 'Alice Johnson', role: 'Manager' }
  ]);
  selectedTheme: string = 'light';
  listItems: string[] = ['View Profile', 'Update Settings', 'Contact Support'];
  sidenavOpened: boolean = false;

  private _transformer = (node: TreeNode, childLevel: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: childLevel,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  treeDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  @ViewChild('trigger') autoCompleteTrigger: MatAutocompleteTrigger;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.treeDataSource.data = [
      { name: 'Dashboard', children: [{ name: 'Overview' }, { name: 'Stats' }] },
      { name: 'Settings', children: [{ name: 'Preferences' }] }
    ];
  }

  ngOnInit() {
    this.filteredFruits = [...this.fruits];
    (window as any).filteredFruits = this.filteredFruits;
    (window as any).appComponent = this;
    console.log('ngOnInit - Skills:', this.skills);
    this.cdr.detectChanges();
  }

  addSkill(event: any): void {
    this.ngZone.run(() => {
      const value = (event.value || '').trim();
      if (value) {
        this.skills.push(value);
        this.cdr.detectChanges();
        console.log('Skill added:', value, 'New skills:', this.skills);
      }
      event.chipInput!.clear();
    });
  }

  removeSkill(skill: string): void {
    this.ngZone.run(() => {
      const index = this.skills.indexOf(skill);
      if (index >= 0) {
        this.skills.splice(index, 1);
        this.cdr.detectChanges();
        console.log('Skill removed:', skill, 'New skills:', this.skills);
      }
    });
  }

  filterFruits(value: string): void {
    this.ngZone.run(() => {
      console.log('filterFruits called with value:', value, 'filteredFruits before:', this.filteredFruits);
      if (!value) {
        this.filteredFruits = [...this.fruits];
      } else {
        this.filteredFruits = this.fruits.filter(fruit =>
          fruit.toLowerCase().includes(value.toLowerCase())
        );
      }
      console.log('filteredFruits after:', this.filteredFruits);
      this.cdr.detectChanges();
      (window as any).filteredFruits = this.filteredFruits;
    });
  }

  openPanel() {
    this.ngZone.run(() => {
      if (this.autoCompleteTrigger) {
        this.autoCompleteTrigger.openPanel();
        this.cdr.detectChanges();
        console.log('Panel opened programmatically');
      }
    });
  }

  showSnackBar() {
    this.snackBar.open('Form submitted successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      width: '300px',
      data: { name: 'John Doe' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with data:', result);
        this.snackBar.open('Support request submitted!', 'Close', { duration: 2000 });
      }
    });
  }

  menuAction(action: string): void {
    console.log(`Menu action: ${action}`);
    this.snackBar.open(`Performed ${action} action`, 'Close', { duration: 2000 });
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}