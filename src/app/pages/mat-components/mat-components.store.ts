import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { User } from './user.model';

interface ApiUser {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  initialized: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  isLoading: boolean;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
}

const initialState: UserState = {
  users: [],
  initialized: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  isLoading: false,
  sortField: null,
  sortDirection: 'asc',
};

const apiUrl = 'https://jsonplaceholder.typicode.com/users';

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ users, searchQuery, pageSize, sortField, sortDirection }) => {
    const filteredUsers = computed(() => {
      let filtered = users().filter(u => {
        const firstName = u.firstName ;
        const email = u.email ;
        const role = u.role ;
        const query = searchQuery().toLowerCase() ;
        return (
          firstName.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          role.toLowerCase().includes(query)
        );
      });

      if (sortField()) {
        filtered = filtered.sort((a, b) => {
          const field = sortField() as keyof User;
          if (field === 'createdDate') {
            const valueA = new Date(a[field] ).getTime();
            const valueB = new Date(b[field] ).getTime();
            return sortDirection() === 'asc' ? valueA - valueB : valueB - valueA;
          } else {
            const valueA = String(a[field] ).toLowerCase();
            const valueB = String(b[field] ).toLowerCase();
            return sortDirection() === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
          }
        });
      }

      return filtered;
    });

    return {
      filteredUsers,
      paginatedUsers: computed(() => {
        const paginated = filteredUsers();
        return paginated;
      }),
      totalPages: computed(() => {
        const total = Math.ceil(filteredUsers().length / pageSize());
        return total;
      }),
      totalRecords: computed(() => filteredUsers().length),
      isLoading: computed(() => !users().length && !initialState.initialized),
      uniqueEmails: computed(() => {
        const emails = users().map(u => u.email ).filter(email => email !== '');
        return [...new Set(emails)].sort();
      }),
      uniqueFirstNames: computed(() => {
        const names = users().map(u => u.firstName ).filter(name => name !== '');
        return [...new Set(names)].sort();
      }),
    };
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadUsers() {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('users');
        let users: User[] = [];
        if (localData) {
          users = JSON.parse(localData).map((u: User) => ({
            id: u.id,
            firstName: u.firstName || 'Unknown',
            email: u.email || 'unknown@example.com',
            role: u.role || 'Guest',
            createdDate: u.createdDate || new Date().toISOString(),
          }));
        } else {
          const apiUsers = await lastValueFrom(http.get<ApiUser[]>(apiUrl));
          users = apiUsers.map(u => ({
            id: u.id,
            firstName: u.name || 'Unknown',
            email: u.email || 'unknown@example.com',
            role: 'Guest',
            createdDate: new Date().toISOString(),
          }));
          localStorage.setItem('users', JSON.stringify(users));
        }
        patchState(store, { users, initialized: true, isLoading: false, error: null });
        return users;
      } catch (error: any) {
        patchState(store, { error: error.message || 'Failed to load users', isLoading: false });
        throw error;
      }
    },
    addUser(user: Omit<User, 'id' | 'createdDate'>) {
      try {
        const newUser: User = {
          ...user,
          id: Date.now(),
          createdDate: new Date().toISOString(),
          firstName: user.firstName || 'Unknown',
          email: user.email || 'unknown@example.com',
          role: user.role || 'Guest',
        };
        const newUsers = [...store.users(), newUser];
        localStorage.setItem('users', JSON.stringify(newUsers));
        patchState(store, { users: newUsers, error: null });
        return newUser;
      } catch (error: any) {
        patchState(store, { error: error.message || 'Failed to add user' });
        throw error;
      }
    },
    updateUser(user: User) {
      try {
        const updatedUsers = store.users().map(u =>
          u.id === user.id
            ? {
                ...user,
                firstName: user.firstName || 'Unknown',
                email: user.email || 'unknown@example.com',
                role: user.role || 'Guest',
                createdDate: user.createdDate || new Date().toISOString(),
              }
            : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        patchState(store, { users: updatedUsers, error: null });
      } catch (error: any) {
        patchState(store, { error: error.message || 'Failed to update user' });
        throw error;
      }
    },
    deleteUser(id: number) {
      try {
        const updatedUsers = store.users().filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        patchState(store, { users: updatedUsers, error: null });
      } catch (error: any) {
        patchState(store, { error: error.message });
        throw error;
      }
    },
    setPage(page: number) {
      patchState(store, { currentPage: page });
    },
    setPageSize(pageSize: number) {
      patchState(store, { pageSize, currentPage: 1 });
    },
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query, currentPage: 1 });
    },
    sortUsers(field: string | null, direction: 'asc' | 'desc') {
      patchState(store, { sortField: field, sortDirection: direction, currentPage: 1 });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadUsers();
    },
  })
);