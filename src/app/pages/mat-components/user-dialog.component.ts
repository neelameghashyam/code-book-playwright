import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { User } from './user.model';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.user ? 'Edit User' : 'Add User' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>First Name</mat-label>
        <input matInput [(ngModel)]="user.firstName" required>
        @if (!user.firstName) {
          <mat-error>First Name is required</mat-error>
        }
      </mat-form-field>
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="user.email" type="email" required>
        @if (!user.email) {
          <mat-error>Email is required</mat-error>
        }
      </mat-form-field>
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Role</mat-label>
        <mat-select [(ngModel)]="user.role" required>
          <mat-option value="Admin">Admin</mat-option>
          <mat-option value="User">User</mat-option>
          <mat-option value="Guest">Guest</mat-option>
        </mat-select>
        @if (!user.role) {
          <mat-error>Role is required</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!isValid()">Save</button>
    </mat-dialog-actions>
  `,
})
export class UserDialogComponent {
  user: Partial<User> = {
    firstName: '',
    email: '',
    role: '',
  };

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User | null }
  ) {
    if (data.user) {
      this.user = { ...data.user };
    }
    console.log('UserDialogComponent: initialized with data', this.data);
  }

  isValid(): boolean {
    const valid = !!this.user.firstName && !!this.user.email && !!this.user.role;
    console.log('UserDialogComponent: isValid', valid, 'user', this.user);
    return valid;
  }

  save() {
    console.log('UserDialogComponent: saving user', this.user);
    this.dialogRef.close(this.user);
  }

  cancel() {
    console.log('UserDialogComponent: cancelled');
    this.dialogRef.close();
  }
}
