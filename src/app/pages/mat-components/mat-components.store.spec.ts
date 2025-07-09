import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UserStore } from './mat-components.store';
import { User } from './user.model';

class MockHttpClient {
  get = jest.fn().mockReturnValue(of([]));
}

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let httpClient: MockHttpClient;

  beforeEach(() => {
    httpClient = new MockHttpClient();
    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: HttpClient, useValue: httpClient },
      ],
    });
    store = TestBed.inject(UserStore);
    localStorage.clear();
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize with default state', () => {
      expect(store.users()).toEqual([]);
      expect(store.initialized()).toBe(true);
      expect(store.error()).toBe(null);
      expect(store.currentPage()).toBe(1);
      expect(store.pageSize()).toBe(10);
      expect(store.searchQuery()).toBe('');
      expect(store.isLoading()).toBe(true);
      expect(store.sortField()).toBe(null);
      expect(store.sortDirection()).toBe('asc');
    });
  });

  describe('loadUsers', () => {
    it('should load users from localStorage if available', async () => {
      const mockUsers: User[] = [
        { id: 1, firstName: 'John', email: 'john@example.com', role: 'Admin', createdDate: '2023-01-01' },
      ];
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockUsers));
      await store.loadUsers();
      expect(store.users()).toEqual(mockUsers);
      expect(store.initialized()).toBe(true);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBe(null);
      expect(httpClient.get).toHaveBeenCalled();
    });

    it('should load users from API if localStorage is empty', async () => {
      const mockApiUsers: any[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
      ];
      httpClient.get.mockReturnValue(of(mockApiUsers));
      await store.loadUsers();
      expect(store.users()).toEqual([
        { id: 1, firstName: 'John Doe', email: 'john@example.com', role: 'Guest', createdDate: expect.any(String) },
      ]);
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify(store.users()));
      expect(store.initialized()).toBe(true);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBe(null);
    });

    it('should handle API error', async () => {
      httpClient.get.mockReturnValue(throwError(() => new Error('API Error')));
      await expect(store.loadUsers()).rejects.toThrow('API Error');
      expect(store.error()).toBe('API Error');
      expect(store.isLoading()).toBe(true);
    });
  });

  describe('addUser', () => {
    it('should add a new user', () => {
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(newUser);
      const addedUser = store.users()[0];
      expect(addedUser).toEqual({
        ...newUser,
        id: expect.any(Number),
        createdDate: expect.any(String),
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify(store.users()));
      expect(store.error()).toBe(null);
    });

    it('should handle error when adding user', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage Error');
      });
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      expect(() => store.addUser(newUser)).toThrow('Storage Error');
      expect(store.error()).toBe('Storage Error');
    });

    it('should handle null/undefined fields when adding user', () => {
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: null as any, email: undefined as any, role: '' };
      store.addUser(newUser);
      const addedUser = store.users()[0];
      expect(addedUser).toEqual({
        id: expect.any(Number),
        createdDate: expect.any(String),
        firstName: 'Unknown',
        email: 'unknown@example.com',
        role: 'Guest',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify(store.users()));
      expect(store.error()).toBe(null);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', () => {
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(newUser);
      const updatedUser = { ...store.users()[0], firstName: 'Janet' };
      store.updateUser(updatedUser);
      expect(store.users()[0].firstName).toBe('Janet');
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify(store.users()));
      expect(store.error()).toBe(null);
    });

    it('should handle error when updating user', () => {
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(newUser);
      jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage Error');
      });
      expect(() => store.updateUser({ ...store.users()[0], firstName: 'Janet' })).toThrow('Storage Error');
      expect(store.error()).toBe('Storage Error');
    });

    it('should handle null/undefined fields when updating user', () => {
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(newUser);
      const updatedUser = { ...store.users()[0], firstName: null as any, email: undefined as any, role: '' };
      store.updateUser(updatedUser);
      expect(store.users()[0]).toEqual({
        id: expect.any(Number),
        createdDate: expect.any(String),
        firstName: 'Unknown',
        email: 'unknown@example.com',
        role: 'Guest',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify(store.users()));
      expect(store.error()).toBe(null);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(newUser);
      const userId = store.users()[0].id;
      store.deleteUser(userId);
      expect(store.users()).toEqual([]);
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify([]));
      expect(store.error()).toBe(null);
    });

    it('should handle error when deleting user', () => {
      const newUser: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(newUser);
      jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage Error');
      });
      expect(() => store.deleteUser(store.users()[0].id)).toThrow('Storage Error');
      expect(store.error()).toBe('Storage Error');
    });
  });

  describe('Computed Signals', () => {
    it('should filter users based on search query', () => {
      const user1: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      const user2: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(user1);
      store.addUser(user2);
      store.setSearchQuery('John');
      expect(store.filteredUsers()).toEqual([
        { id: expect.any(Number), firstName: 'John', email: 'john@example.com', role: 'Admin', createdDate: expect.any(String) },
      ]);
    });

    it('should sort users by firstName', () => {
      const user1: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      const user2: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(user1);
      store.addUser(user2);
      store.sortUsers('firstName', 'asc');
      expect(store.filteredUsers()[0].firstName).toBe('Jane');
      store.sortUsers('firstName', 'desc');
      expect(store.filteredUsers()[0].firstName).toBe('John');
    });

    it('should sort users by createdDate', () => {
      const user1: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      const user2: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(user1);
      jest.advanceTimersByTime(1000);
      store.addUser(user2);
      store.sortUsers('createdDate', 'asc');
      expect(store.filteredUsers()[0].firstName).toBe('John');
      store.sortUsers('createdDate', 'desc');
      expect(store.filteredUsers()[0].firstName).toBe('Jane');
    });

    it('should compute unique first names', () => {
      const user1: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      const user2: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(user1);
      store.addUser(user2);
      expect(store.uniqueFirstNames()).toEqual(['Jane', 'John']);
    });

    it('should compute unique emails', () => {
      const user1: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      const user2: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(user1);
      store.addUser(user2);
      expect(store.uniqueEmails()).toEqual(['jane@example.com', 'john@example.com']);
    });

    it('should compute total records', () => {
      const user: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      store.addUser(user);
      expect(store.totalRecords()).toBe(1);
    });

    it('should compute total pages', () => {
      const user1: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      const user2: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
      store.addUser(user1);
      store.addUser(user2);
      store.setPageSize(1);
      expect(store.totalPages()).toBe(2);
      store.setPageSize(10);
      expect(store.totalPages()).toBe(1);
    });

    it('should compute paginated users', () => {
  // Arrange: Add two users
  const user1: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
  const user2: Omit<User, 'id' | 'createdDate'> = { firstName: 'Jane', email: 'jane@example.com', role: 'User' };
  store.addUser(user1);
  store.addUser(user2);

  // Act: Set page size to 1 and select page 1
  store.setPageSize(1);
  store.setPage(1);
  // Act: Select page 2
  store.setPage(2);
  
});
  });

  describe('Pagination and Sorting Methods', () => {
    it('should set page', () => {
      store.setPage(2);
      expect(store.currentPage()).toBe(2);
    });

    it('should set page size and reset current page', () => {
      store.setPage(2);
      store.setPageSize(20);
      expect(store.pageSize()).toBe(20);
      expect(store.currentPage()).toBe(1);
    });

    it('should set search query and reset current page', () => {
      store.setPage(2);
      store.setSearchQuery('test');
      expect(store.searchQuery()).toBe('test');
      expect(store.currentPage()).toBe(1);
    });

    it('should sort users and reset current page', () => {
      store.setPage(2);
      store.sortUsers('firstName', 'desc');
      expect(store.sortField()).toBe('firstName');
      expect(store.sortDirection()).toBe('desc');
      expect(store.currentPage()).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user list in computed signals', () => {
      expect(store.filteredUsers()).toEqual([]);
      expect(store.paginatedUsers()).toEqual([]);
      expect(store.totalRecords()).toBe(0);
      expect(store.totalPages()).toBe(0);
      expect(store.uniqueFirstNames()).toEqual([]);
      expect(store.uniqueEmails()).toEqual([]);
    });

    it('should handle invalid sort field', () => {
      const user: Omit<User, 'id' | 'createdDate'> = { firstName: 'John', email: 'john@example.com', role: 'Admin' };
      store.addUser(user);
      store.sortUsers('invalidField' as any, 'asc');
      expect(store.filteredUsers()).toEqual([
        { id: expect.any(Number), firstName: 'John', email: 'john@example.com', role: 'Admin', createdDate: expect.any(String) },
      ]);
    });
  });
});