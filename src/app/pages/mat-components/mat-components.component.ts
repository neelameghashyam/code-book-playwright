import { Component, inject, ViewChild, AfterViewInit, OnDestroy, effect, EffectRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserStore } from './mat-components.store';
import { User } from './user.model';
import { UserDialogComponent } from './user-dialog.component';
import { untracked } from '@angular/core';

@Component({
  selector: 'app-mat-components',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './mat-components.component.html',
  styleUrls: ['./mat-components.component.scss'],
})
export class MatComponentsComponent implements AfterViewInit, OnDestroy {
  private userStore = inject(UserStore);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  public isLoading = this.userStore.isLoading;
  public error = this.userStore.error;
  public pageSize = this.userStore.pageSize;
  public currentPage = this.userStore.currentPage;
  public filteredUsers = this.userStore.filteredUsers;
  public totalRecords = this.userStore.totalRecords;

  private destroyEffect: EffectRef | null = null;

  displayedColumns: string[] = ['id', 'firstName', 'email', 'role', 'createdDate', 'actions'];
  dataSource = new MatTableDataSource<User>();
  filterValues = {
    global: '',
    firstName: '',
    email: '',
    role: [] as string[],
    startDate: null as Date | null,
    endDate: null as Date | null,
  };
  roles = ['Admin', 'User', 'Guest'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.destroyEffect = effect(() => {
      const paginatedUsers = this.userStore.paginatedUsers();
      const filteredUsersLength = this.userStore.totalRecords();
      untracked(() => {
        this.dataSource.data = paginatedUsers;
        if (this.paginator) {
          this.paginator.length = filteredUsersLength;
          this.paginator.pageIndex = this.userStore.currentPage() - 1;
          this.paginator.pageSize = this.userStore.pageSize();
          this.dataSource._updateChangeSubscription();
          this.cdr.markForCheck();
        }
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this.createFilterPredicate();
    if (this.paginator) {
      this.paginator.pageSize = this.userStore.pageSize();
      this.paginator.length = this.userStore.totalRecords();
      this.paginator._changePageSize(this.paginator.pageSize);
    }
    this.userStore.loadUsers();
  }

  ngOnDestroy() {
    if (this.destroyEffect) {
      this.destroyEffect.destroy();
      this.destroyEffect = null;
    }
  }

  createFilterPredicate() {
    return (data: User, filter: string): boolean => {
      const filterValues = JSON.parse(filter);
      const globalSearch =
        !filterValues.global ||
        (data.firstName ?? '').toLowerCase().includes(filterValues.global.toLowerCase()) ||
        (data.email ?? '').toLowerCase().includes(filterValues.global.toLowerCase()) ||
        (data.role ?? '').toLowerCase().includes(filterValues.global.toLowerCase());

      const firstNameSearch =
        !filterValues.firstName ||
        (data.firstName ?? '').toLowerCase().includes(filterValues.firstName.toLowerCase());

      const emailSearch =
        !filterValues.email ||
        (data.email ?? '').toLowerCase().includes(filterValues.email.toLowerCase());

      const roleSearch = !filterValues.role.length || filterValues.role.includes(data.role ?? '');

      const dateSearch =
        (!filterValues.startDate || new Date(data.createdDate) >= new Date(filterValues.startDate)) &&
        (!filterValues.endDate || new Date(data.createdDate) <= new Date(filterValues.endDate));

      const result = globalSearch && firstNameSearch && emailSearch && roleSearch && dateSearch;
      return result;
    };
  }

  applyFilter() {
    this.dataSource.filter = JSON.stringify(this.filterValues);
    this.userStore.setPage(1);
    if (this.paginator) {
      const filteredLength = this.userStore.totalRecords();
      this.paginator.length = filteredLength;
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = this.userStore.pageSize();
      this.paginator._changePageSize(this.paginator.pageSize);
      this.dataSource._updateChangeSubscription();
      this.cdr.markForCheck();
    }
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      maxWidth: '100vw',
      data: { user: null },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.firstName && result.email && result.role) {
        try {
          this.userStore.addUser(result);
          this.userStore.sortUsers('createdDate', 'desc');
          this.syncPaginator();
          this.applyFilter();
          this.dataSource._updateChangeSubscription();
          this.cdr.markForCheck();
        } catch (error) {
          console.error('openAddDialog: addUser failed', error);
        }
      } else {
        console.warn('openAddDialog: invalid or no result', result);
      }
    });
  }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      maxWidth: '100vw',
      data: { user },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        try {
          this.userStore.updateUser(result);
          this.syncPaginator();
          this.applyFilter();
          this.dataSource._updateChangeSubscription();
          this.cdr.markForCheck();
        } catch (error) {
          console.error('openEditDialog: updateUser failed', error);
        }
      }
    });
  }

  deleteUser(id: number) {
    try {
      this.userStore.deleteUser(id);
      this.syncPaginator();
      this.applyFilter();
      this.dataSource._updateChangeSubscription();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('deleteUser: delete failed', error);
    }
  }

  syncPaginator() {
    if (this.paginator) {
      const totalRecords = this.userStore.totalRecords();
      const currentPage = this.userStore.currentPage();
      const pageSize = this.userStore.pageSize();
      const totalPages = this.userStore.totalPages();
      // Ensure current page is valid
      const validPage = Math.min(Math.max(1, currentPage), totalPages);
      this.paginator.length = totalRecords;
      this.paginator.pageIndex = validPage - 1;
      this.paginator.pageSize = pageSize;
      this.paginator._changePageSize(pageSize);
      this.userStore.setPage(validPage);
      this.cdr.markForCheck();
    }
  }

  refreshTable() {
    this.filterValues = {
      global: '',
      firstName: '',
      email: '',
      role: [],
      startDate: null,
      endDate: null,
    };
    this.userStore.setSearchQuery('');
    this.userStore.setPage(1);
    this.userStore.sortUsers(null, 'asc');
    try {
      this.userStore.loadUsers();
      this.syncPaginator();
      this.applyFilter();
      this.dataSource._updateChangeSubscription();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('refreshTable: loadUsers failed', error);
    }
  }

  onPageChange(event: PageEvent) {
    this.userStore.setPage(event.pageIndex + 1);
    this.userStore.setPageSize(event.pageSize);
    this.paginator.pageSize = this.userStore.pageSize();
    this.dataSource._updateChangeSubscription();
    this.cdr.markForCheck();
  }

  trackById(index: number, user: User): number {
    return user.id;
  }
}