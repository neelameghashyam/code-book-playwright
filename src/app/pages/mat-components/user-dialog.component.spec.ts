import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserDialogComponent } from './user-dialog.component';
import { User } from './user.model';

describe('UserDialogComponent', () => {
  let component: UserDialogComponent;
  let fixture: ComponentFixture<UserDialogComponent>;
  let dialogRef: { close: jest.Mock };

  beforeEach(waitForAsync(() => {
    dialogRef = { close: jest.fn() };

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        FormsModule,
        NoopAnimationsModule,
        UserDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { user: null } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize user with empty values for add dialog', () => {
      expect(component.user).toEqual({ firstName: '', email: '', role: '' });
    });

    it('should initialize user with provided data for edit dialog', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          MatDialogModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          FormsModule,
          NoopAnimationsModule,
          UserDialogComponent,
        ],
        providers: [
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: MAT_DIALOG_DATA,
            useValue: { user: { id: 1, firstName: 'John', email: 'john@example.com', role: 'Admin', createdDate: '2023-01-01' } },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(UserDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user).toEqual({ id: 1, firstName: 'John', email: 'john@example.com', role: 'Admin', createdDate: '2023-01-01' });
    });
  });

  describe('Template Rendering', () => {
    it('should render dialog title as Add User for new user', () => {
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toContain('Add User');
    });

    it('should render dialog title as Edit User for existing user', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          MatDialogModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          FormsModule,
          NoopAnimationsModule,
          UserDialogComponent,
        ],
        providers: [
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: MAT_DIALOG_DATA,
            useValue: { user: { id: 1, firstName: 'John', email: 'john@example.com', role: 'Admin', createdDate: '2023-01-01' } },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(UserDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toContain('Edit User');
    });

    it('should render form fields', () => {
      const formFields = fixture.nativeElement.querySelectorAll('mat-form-field');
      expect(formFields.length).toBe(3);
      expect(formFields[0].querySelector('[data-testid="first-name-input"]')).toBeTruthy();
      expect(formFields[1].querySelector('[data-testid="email-input"]')).toBeTruthy();
      expect(formFields[2].querySelector('[data-testid="role-select"]')).toBeTruthy();
    });

    it('should render Cancel and Save buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[0].textContent).toContain('Cancel');
      expect(buttons[1].textContent).toContain('Save');
    });
  });

  describe('Form Validation', () => {
    it('should disable Save button when form is invalid', () => {
      const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
      expect(saveButton.disabled).toBe(true);
    });

    it('should enable Save button when form is valid', () => {
      component.user = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      fixture.detectChanges();
      const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
      expect(saveButton.disabled).toBe(false);
    });

    it('should show error messages for empty fields', () => {
      const firstNameInput = fixture.nativeElement.querySelector('[data-testid="first-name-input"]');
      firstNameInput.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="first-name-error"]').textContent).toContain('First Name is required');
    });
  });

  describe('User Actions', () => {
    it('should close dialog with user data on save', () => {
      component.user = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      fixture.detectChanges();
      const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
      saveButton.click();
      expect(dialogRef.close).toHaveBeenCalledWith(component.user);
    });

    it('should close dialog without data on cancel', () => {
      const cancelButton = fixture.nativeElement.querySelector('[data-testid="cancel-button"]');
      cancelButton.click();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });
});
