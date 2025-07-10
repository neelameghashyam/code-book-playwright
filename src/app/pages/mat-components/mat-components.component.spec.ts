import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { MatComponentsComponent } from './mat-components.component';
import { UserStore } from './mat-components.store';
import { UserDialogComponent } from './user-dialog.component';
import { of, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { By } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';

// Mock Services
class MockUserStore {
  users = jest.fn().mockReturnValue([]);
  filteredUsers = jest.fn().mockReturnValue([]);
  paginatedUsers = jest.fn().mockReturnValue([]);
  totalRecords = jest.fn().mockReturnValue(0);
  totalPages = jest.fn().mockReturnValue(1);
  isLoading = jest.fn().mockReturnValue(false);
  error = jest.fn().mockReturnValue(null);
  pageSize = jest.fn().mockReturnValue(10);
  currentPage = jest.fn().mockReturnValue(1);
  uniqueFirstNames = jest.fn().mockReturnValue([]);
  loadUsers = jest.fn();
  addUser = jest.fn();
  updateUser = jest.fn();
  deleteUser = jest.fn();
  setPage = jest.fn();
  setPageSize = jest.fn();
  setSearchQuery = jest.fn();
  sortUsers = jest.fn();
}

class MockToastrService {
  success = jest.fn();
  error = jest.fn();
}

class MockMatDialog {
  open = jest.fn().mockImplementation(() => ({
    afterClosed: () => of(null),
    componentInstance: {},
    _overlayRef: { overlayElement: document.createElement('div') },
  }));
}

class MockChangeDetectorRef {
  markForCheck = jest.fn();
}

describe('MatComponentsComponent', () => {
  let component: MatComponentsComponent;
  let fixture: ComponentFixture<MatComponentsComponent>;
  let userStore: MockUserStore;
  let toastrService: MockToastrService;
  let dialog: MockMatDialog;
  let cdr: MockChangeDetectorRef;

  const mockUsers: User[] = [
    { id: 1, firstName: 'John', email: 'john@example.com', role: 'Admin', createdDate: '2023-01-01' },
    { id: 2, firstName: 'Jane', email: 'jane@example.com', role: 'User', createdDate: '2023-02-01' },
    { id: 3, firstName: null, email: null, role: null, createdDate: null },
  ];

  beforeEach(waitForAsync(() => {
    userStore = new MockUserStore();
    toastrService = new MockToastrService();
    dialog = new MockMatDialog();
    cdr = new MockChangeDetectorRef();

    TestBed.configureTestingModule({
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
        MatAutocompleteModule,
        NoopAnimationsModule,
        MatComponentsComponent,
      ],
      providers: [
        { provide: UserStore, useValue: userStore },
        { provide: ToastrService, useValue: toastrService },
        { provide: MatDialog, useValue: dialog },
        { provide: ChangeDetectorRef, useValue: cdr },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatComponentsComponent);
    component = fixture.componentInstance;
    userStore.paginatedUsers.mockReturnValue(mockUsers);
    userStore.totalRecords.mockReturnValue(mockUsers.length);
    userStore.users.mockReturnValue(mockUsers);
    userStore.uniqueFirstNames.mockReturnValue(['John', 'Jane']);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize filterValues with default values', () => {
      expect(component.filterValues).toEqual({
        global: '',
        firstName: '',
        email: '',
        role: [],
        startDate: null,
        endDate: null,
      });
    });

    it('should initialize roles array', () => {
      expect(component.roles).toEqual(['Admin', 'User', 'Guest']);
    });

    it('should initialize displayedColumns', () => {
      expect(component.displayedColumns).toEqual(['id', 'firstName', 'email', 'role', 'createdDate', 'actions']);
    });

    it('should initialize dataSource as MatTableDataSource', () => {
      expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
      expect(component.dataSource.data).toEqual(mockUsers);
    });

    it('should initialize allEmails and filteredEmails', () => {
      expect(component.allEmails).toEqual(['john@example.com', 'jane@example.com']);
      expect(component.filteredEmails).toEqual(['john@example.com', 'jane@example.com']);
    });
  });

  describe('Constructor and Effect', () => {
    it('should set up effect and update dataSource', () => {
      expect(component.dataSource.data).toEqual(mockUsers);
    });

    it('should not update paginator in effect if paginator is undefined', () => {
      component.paginator = undefined as any;
      component.dataSource.data = [];
      expect(() => {
        component.dataSource.data = mockUsers;
      }).not.toThrow();
    });
  });

  describe('createFilterPredicate', () => {
    it('should return false when global filter does not match', () => {
      component.filterValues = {
        global: 'invalid',
        firstName: '',
        email: '',
        role: [],
        startDate: null,
        endDate: null,
      };
      const predicate = component.createFilterPredicate();
      expect(predicate(mockUsers[0], JSON.stringify(component.filterValues))).toBe(false);
    });

    it('should return false when firstName filter does not match', () => {
      component.filterValues = {
        global: '',
        firstName: 'Jane',
        email: '',
        role: [],
        startDate: null,
        endDate: null,
      };
      const predicate = component.createFilterPredicate();
      expect(predicate(mockUsers[0], JSON.stringify(component.filterValues))).toBe(false);
    });

    it('should return false when email filter does not match', () => {
      component.filterValues = {
        global: '',
        firstName: '',
        email: 'invalid@example.com',
        role: [],
        startDate: null,
        endDate: null,
      };
      const predicate = component.createFilterPredicate();
      expect(predicate(mockUsers[0], JSON.stringify(component.filterValues))).toBe(false);
    });

    it('should return false when role filter does not match', () => {
      component.filterValues = {
        global: '',
        firstName: '',
        email: '',
        role: ['User'],
        startDate: null,
        endDate: null,
      };
      const predicate = component.createFilterPredicate();
      expect(predicate(mockUsers[0], JSON.stringify(component.filterValues))).toBe(false);
    });

    it('should return false when date range does not match', () => {
      component.filterValues = {
        global: '',
        firstName: '',
        email: '',
        role: [],
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-02-01'),
      };
      const predicate = component.createFilterPredicate();
      expect(predicate(mockUsers[0], JSON.stringify(component.filterValues))).toBe(false);
    });

    it('should handle null fields in user data', () => {
      component.filterValues = {
        global: '',
        firstName: '',
        email: '',
        role: [],
        startDate: null,
        endDate: null,
      };
      const predicate = component.createFilterPredicate();
      expect(predicate(mockUsers[2], JSON.stringify(component.filterValues))).toBe(true);
    });
  });

  describe('trackById', () => {
    it('should return user id', () => {
      expect(component.trackById(0, mockUsers[0])).toBe(1);
    });
  });

  describe('Template Rendering', () => {
    it('should render toolbar with title and buttons', () => {
      const toolbar = fixture.debugElement.query(By.css('[data-testid="user-management-toolbar"]'));
      expect(toolbar).toBeTruthy();
      expect(toolbar.query(By.css('[data-testid="toolbar-title"]')).nativeElement.textContent).toContain(
        'User Management'
      );
      expect(toolbar.query(By.css('[data-testid="add-user-button"]'))).toBeTruthy();
      expect(toolbar.query(By.css('[data-testid="refresh-button"]'))).toBeTruthy();
    });

    it('should render error message when error exists', () => {
      userStore.error.mockReturnValue('Server error');
      fixture.detectChanges();
      const errorDiv = fixture.debugElement.query(By.css('[data-testid="error-message"]'));
      expect(errorDiv).toBeTruthy();
      expect(errorDiv.nativeElement.textContent).toContain('Server error');
    });

    it('should render loading spinner when isLoading is true', () => {
      userStore.isLoading.mockReturnValue(true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('[data-testid="loading-indicator"]'))).toBeTruthy();
    });

    it('should render filters when not loading', () => {
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const filters = fixture.debugElement.query(By.css('[data-testid="user-filters"]'));
      expect(filters.query(By.css('[data-testid="global-search"]'))).toBeTruthy();
      expect(filters.query(By.css('[data-testid="first-name-filter"]'))).toBeTruthy();
      expect(filters.query(By.css('[data-testid="email-filter"]'))).toBeTruthy();
      expect(filters.query(By.css('[data-testid="role-filter"]'))).toBeTruthy();
      expect(filters.query(By.css('[data-testid="date-range-filter"]'))).toBeTruthy();
    });

    it('should render table with correct columns and data', () => {
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const table = fixture.debugElement.query(By.css('[data-testid="user-table"]'));
      const headers = table.queryAll(By.css('th'));
      expect(headers.length).toBe(6);
      expect(headers[0].nativeElement.textContent).toContain('ID');
      expect(headers[1].nativeElement.textContent).toContain('First Name');
      expect(headers[2].nativeElement.textContent).toContain('Email');
      expect(headers[3].nativeElement.textContent).toContain('Role');
      expect(headers[4].nativeElement.textContent).toContain('Created Date');
      expect(headers[5].nativeElement.textContent).toContain('Actions');

      const rows = table.queryAll(By.css('[data-testid="table-row"]'));
      expect(rows.length).toBe(3);
      const firstRowCells = rows[0].queryAll(By.css('td'));
      expect(firstRowCells[0].nativeElement.textContent).toContain('1');
      expect(firstRowCells[1].nativeElement.textContent).toContain('John');
      expect(firstRowCells[2].nativeElement.textContent).toContain('john@example.com');
      expect(firstRowCells[3].nativeElement.textContent).toContain('Admin');
    });

    it('should render paginator with correct options', () => {
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const paginator = fixture.debugElement.query(By.css('[data-testid="table-paginator"]'));
      expect(paginator.componentInstance.pageSizeOptions).toEqual([5, 10, 20]);
      expect(paginator.componentInstance.pageSize).toBe(10);
      expect(paginator.componentInstance.length).toBe(3);
    });

    it('should trigger refreshTable on refresh button click', () => {
    jest.spyOn(component, 'refreshTable');
    const refreshButton = fixture.debugElement.query(By.css('[data-testid="refresh-button"]'));
    refreshButton.triggerEventHandler('click', null);
    expect(component.refreshTable).toHaveBeenCalled();

    // Test error handling in refreshTable
    userStore.loadUsers.mockImplementation(() => {
      throw new Error('Refresh failed');
    });
    component.refreshTable();
    expect(toastrService.error).toHaveBeenCalledWith('Failed to refresh table', 'Error');
    expect(console.error).not.toHaveBeenCalledWith('refreshTable: loadUsers failed', expect.any(Error));
  });

    it('should trigger deleteUser on delete button click', () => {
      jest.spyOn(component, 'deleteUser');
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const deleteButton = fixture.debugElement.queryAll(By.css('[data-testid="delete-button"]'))[0];
      deleteButton.triggerEventHandler('click', null);
      expect(component.deleteUser).toHaveBeenCalledWith(1);
    });

    

    it('should update global filter and call applyFilter', () => {
      jest.spyOn(component, 'applyFilter');
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const globalInput = fixture.debugElement.query(By.css('[data-testid="global-search-input"]'));
      globalInput.triggerEventHandler('ngModelChange', 'john');
      expect(component.filterValues.global).toBe('john');
      expect(component.applyFilter).toHaveBeenCalled();
    });

    it('should update firstName filter and call applyFilter', () => {
      jest.spyOn(component, 'applyFilter');
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const firstNameSelect = fixture.debugElement.query(By.css('[data-testid="first-name-select"]'));
      firstNameSelect.triggerEventHandler('ngModelChange', 'John');
      expect(component.filterValues.firstName).toBe('John');
      expect(component.applyFilter).toHaveBeenCalled();
    });

    it('should update email filter and call applyFilter', () => {
      jest.spyOn(component, 'applyFilter');
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const emailInput = fixture.debugElement.query(By.css('[data-testid="email-input"]'));
      emailInput.triggerEventHandler('ngModelChange', 'john@example.com');
      expect(component.filterValues.email).toBe('john@example.com');
      expect(component.applyFilter).toHaveBeenCalled();
    });

    it('should update role filter and call applyFilter', () => {
      jest.spyOn(component, 'applyFilter');
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const roleSelect = fixture.debugElement.query(By.css('[data-testid="role-select"]'));
      roleSelect.triggerEventHandler('ngModelChange', ['Admin']);
      expect(component.filterValues.role).toEqual(['Admin']);
      expect(component.applyFilter).toHaveBeenCalled();
    });

    it('should update date range filter and call applyFilter', () => {
      jest.spyOn(component, 'applyFilter');
      userStore.isLoading.mockReturnValue(false);
      fixture.detectChanges();
      const startDateInput = fixture.debugElement.query(By.css('[data-testid="start-date-input"]'));
      const endDateInput = fixture.debugElement.query(By.css('[data-testid="end-date-input"]'));
      startDateInput.triggerEventHandler('ngModelChange', new Date('2023-01-01'));
      endDateInput.triggerEventHandler('ngModelChange', new Date('2023-01-01'));
      expect(component.filterValues.startDate).toEqual(new Date('2023-01-01'));
      expect(component.filterValues.endDate).toEqual(new Date('2023-01-01'));
      expect(component.applyFilter).toHaveBeenCalledTimes(2);
    });
  });
  
});