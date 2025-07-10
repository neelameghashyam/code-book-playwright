import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainDashboard2Component } from './main-dashboard-2.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { ThemeService } from '../services/theme/theme.service';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslocoRootModule } from '../transloco-root.module';
import { CustomSidenav2Component } from '../custom-sidenav-2/custom-sidenav-2.component';
import { UserComponent } from '../user/user.component';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Signal } from '@angular/core';
import { AuthStore } from '../login/auth.store';

// Define Theme interface to match expected structure
interface Theme {
  id: string;
  displayName: string;
  primary: string;
  darkModeClass: string;
  lightModeClass: string;
}

// Define AuthStoreType interface from auth.store.spec.ts
interface AuthStoreType {
  user: Signal<{ id: number; email: string; name: string } | null>;
  token: Signal<string | null>;
  isAuthenticated: Signal<boolean>;
  error: Signal<string | null>;
  isLoading: Signal<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (userData: { name: string; email: string; password: string }) => Promise<void>;
  signout: () => void;
}

describe('MainDashboard2Component', () => {
  let component: MainDashboard2Component;
  let fixture: ComponentFixture<MainDashboard2Component>;
  let responsiveService: jest.Mocked<ResponsiveService>;
  let darkModeService: jest.Mocked<DarkModeService>;
  let themeService: jest.Mocked<ThemeService>;
  let translateService: jest.Mocked<TranslateService>;
  let authStore: jest.Mocked<AuthStoreType>;
  let localStorageMock: { [key: string]: jest.Mock };

  beforeEach(async () => {
    // Mock services with all required properties and methods
    responsiveService = {
      currentBreakpoint: jest.fn(() => of('desktop') as Observable<string>),
      isMobile: jest.fn().mockReturnValue(false),
      isTablet: jest.fn().mockReturnValue(false),
      isDesktop: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<ResponsiveService>;

    darkModeService = {
      isVisible: jest.fn(),
      selectedTheme: jest.fn().mockReturnValue({ name: 'light', icon: 'light_mode' }),
      isDarkMode: jest.fn(),
      setTheme: jest.fn(),
      getThemes: jest.fn().mockReturnValue([
        { name: 'light', icon: 'light_mode' },
        { name: 'dark', icon: 'dark_mode' },
      ]),
      applyTheme: jest.fn(),
    } as unknown as jest.Mocked<DarkModeService>;

    themeService = {
      currentTheme: jest.fn().mockReturnValue({
        id: 'theme1',
        displayName: 'Blue',
        primary: '#0000FF',
        darkModeClass: 'dark-blue',
        lightModeClass: 'light-blue',
      }),
      getThemes: jest.fn().mockReturnValue([
        { id: 'theme1', displayName: 'Blue', primary: '#0000FF', darkModeClass: 'dark-blue', lightModeClass: 'light-blue' },
        { id: 'theme2', displayName: 'Red', primary: '#FF0000', darkModeClass: 'dark-red', lightModeClass: 'light-red' },
      ]),
      setTheme: jest.fn(),
    } as unknown as jest.Mocked<ThemeService>;

    translateService = {
      store: new TranslateStore(),
      currentLoader: {} as any,
      compiler: {} as any,
      parser: {} as any,
      addLangs: jest.fn(),
      setDefaultLang: jest.fn(),
      use: jest.fn().mockReturnValue(of('en')),
      getBrowserLang: jest.fn(),
      getBrowserCultureLang: jest.fn(),
      get: jest.fn().mockImplementation((key: string) => of(`translated-${key}`)),
      onTranslationChange: new Subject(),
      onLangChange: new Subject(),
      onDefaultLangChange: new Subject(),
    } as unknown as jest.Mocked<TranslateService>;

    authStore = {
      user: jest.fn().mockReturnValue(null),
      token: jest.fn().mockReturnValue(null),
      isAuthenticated: jest.fn().mockReturnValue(false),
      error: jest.fn().mockReturnValue(null),
      isLoading: jest.fn().mockReturnValue(false),
      login: jest.fn(),
      signup: jest.fn(),
      signout: jest.fn(),
    } as unknown as jest.Mocked<AuthStoreType>;

    // Mock localStorage with proper JSON or null
    localStorageMock = {
      getItem: jest.fn().mockImplementation((key: string) => {
        if (key === 'lang') return 'en';
        if (key === 'auth') return JSON.stringify({ user: { id: 1, email: 'test@example.com', name: 'Test' }, token: 'abc' });
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock document fullscreen APIs
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [
        MainDashboard2Component,
        RouterTestingModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        MatButtonToggleModule,
        TranslocoRootModule,
        CustomSidenav2Component,
        UserComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveService },
        { provide: DarkModeService, useValue: darkModeService },
        { provide: ThemeService, useValue: themeService },
        { provide: TranslateService, useValue: translateService },
        { provide: AuthStore, useValue: authStore },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fixture = TestBed.createComponent(MainDashboard2Component);
    component = fixture.componentInstance;

    // Mock ViewChild with spies
    component.sidenav = {
      open: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    } as any;
    jest.spyOn(component.sidenav, 'open');
    jest.spyOn(component.sidenav, 'close');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct title', () => {
    expect(component.title).toBe('Code Book');
  });

  it('should initialize collapsed signal as false', () => {
    expect(component.collapsed()).toBe(false);
  });

  it('should initialize currentLanguage signal as English', () => {
    expect(component.currentLanguage()).toBe('English');
  });

  it('should initialize darkModeValue signal from DarkModeService', () => {
    expect(component.darkModeValue()).toBe('light');
  });

  it('should add languages in constructor', () => {
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
  });

  it('should initialize with default language from localStorage (en)', () => {
     fixture.detectChanges();
     expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
     expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
     expect(translateService.use).toHaveBeenCalledWith('en');
     expect(component.currentLanguage()).toBe('English');
   });

   it('should change language to French', () => {
     fixture.detectChanges();
     component.ChangeLang('fr');
     expect(translateService.use).toHaveBeenCalledWith('fr');
     expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'fr');
     expect(component.currentLanguage()).toBe('French');
   });
 
   it('should change language to English', () => {
     fixture.detectChanges();
     component.ChangeLang('en');
     expect(translateService.use).toHaveBeenCalledWith('en');
     expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'en');
     expect(component.currentLanguage()).toBe('English');
   });
 

  it('should return correct theme aria label', () => {
    expect(component.getThemeAriaLabel('dark')).toBe('Dark theme');
    expect(component.getThemeAriaLabel('light')).toBe('Light theme');
  });

  it('should return correct color theme aria label', () => {
    expect(component.getColorThemeAriaLabel('Blue')).toBe('Blue color theme');
    expect(component.getColorThemeAriaLabel('Red')).toBe('Red color theme');
  });

  it('should toggle fullscreen when not in fullscreen', async () => {
    await component.toggleFullScreen();
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('should exit fullscreen when in fullscreen', async () => {
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, writable: true });
    await component.toggleFullScreen();
    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('should handle fullscreen error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (document.documentElement.requestFullscreen as jest.Mock).mockRejectedValue(new Error('Fullscreen denied'));
    await component.toggleFullScreen();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error attempting to enable fullscreen: Fullscreen denied');
    consoleErrorSpy.mockRestore();
  });

  it('should compute sidenavWidth for mobile', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    expect(component.sidenavWidth()).toBe('200px');
  });

  it('should compute sidenavWidth for non-mobile collapsed', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(true);
    fixture.detectChanges();
    expect(component.sidenavWidth()).toBe('64px');
  });

  it('should compute sidenavWidth for non-mobile non-collapsed', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(false);
    fixture.detectChanges();
    expect(component.sidenavWidth()).toBe('200px');
  });

  it('should compute sidenavMode for mobile', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    expect(component.sidenavMode());
  });

  it('should compute sidenavMode for non-mobile', () => {
    responsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    expect(component.sidenavMode()).toBe('side');
  });

  it('should compute sidenavOpened for mobile and collapsed', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(true);
    fixture.detectChanges();
    expect(component.sidenavOpened());
  });

  it('should compute sidenavOpened for mobile and non-collapsed', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(false);
    fixture.detectChanges();
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should compute sidenavOpened for non-mobile', () => {
    responsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should toggle sidenav collapsed state', () => {
    component.toggleSidenav();
    expect(component.collapsed()).toBe(true);
    component.toggleSidenav();
    expect(component.collapsed()).toBe(false);
  });

  it('should toggle sidenav when clicking the menu button', () => {
    const menuButton = fixture.debugElement.query(By.css('button[aria-label="Toggle side navigation"]'));
    menuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.collapsed()).toBe(true);
    
  });

  it('should close sidenav on mobile when clicking content area', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(false);
    fixture.detectChanges();
    const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
    sidenavContent.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.sidenav.close)
  });

  it('should not close sidenav on non-mobile when clicking content area', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(false);
    fixture.detectChanges();
    const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
    sidenavContent.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.sidenav.close)
  });

  it('should open mobile menu when clicking mobile menu button', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
    expect(mobileMenuButton).toBeTruthy();
  });

  it('should toggle dark mode via button toggle group', () => {
    const toggleGroup = fixture.debugElement.query(By.css('mat-button-toggle-group'));
    component.darkModeValue.set('light'); // Ensure initial state
    fixture.detectChanges();
    toggleGroup.triggerEventHandler('change', { value: 'dark' });
    fixture.detectChanges();
    expect(component.darkModeValue())
  });

  it('should select dark theme from dark mode menu', () => {
    const darkModeMenuButton = fixture.debugElement.query(By.css('button[aria-label="Select light or dark theme"]'));
    darkModeMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const darkThemeButton = fixture.debugElement.query(By.css('button[aria-label="Dark theme"]'));
    darkThemeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(darkModeService.setTheme).toHaveBeenCalledWith('dark');
  });

  it('should select color theme from color theme menu', () => {
    const colorThemeMenuButton = fixture.debugElement.query(By.css('button[aria-label="Select color theme"]'));
    colorThemeMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const redThemeButton = fixture.debugElement.query(By.css('button[aria-label="Red color theme"]'));
    redThemeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(themeService.setTheme).toHaveBeenCalledWith('theme2');
  });

 
  it('should toggle fullscreen from mobile menu', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
    mobileMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const fullscreenButton = fixture.debugElement.query(By.css('button[aria-label="Toggle full screen"]'));
    fullscreenButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('should select light mode from mobile menu', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.darkModeValue.set('dark');
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
    mobileMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const lightModeButton = fixture.debugElement.query(By.css('button[aria-label="Switch to Light Mode"]'));
    lightModeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.darkModeValue()).toBe('light');
    expect(darkModeService.setTheme).toHaveBeenCalledWith('light');
  });

  it('should select dark mode from mobile menu', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.darkModeValue.set('light');
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
    mobileMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const darkModeButton = fixture.debugElement.query(By.css('button[aria-label="Switch to Dark Mode"]'));
    darkModeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.darkModeValue()).toBe('dark');
    expect(darkModeService.setTheme).toHaveBeenCalledWith('dark');
  });

  it('should open theme menu from mobile menu', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
    mobileMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const themeMenuButton = fixture.debugElement.query(By.css('button[aria-label="Select theme"]'));
    expect(themeMenuButton).toBeTruthy();
  });

  it('should open color theme menu from mobile menu', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
    mobileMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const colorThemeMenuButton = fixture.debugElement.query(By.css('button[aria-label="Select color theme"]'));
    expect(colorThemeMenuButton).toBeTruthy();
  });

  it('should open language menu from mobile menu', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
    mobileMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const languageMenuButton = fixture.debugElement.query(By.css('button[aria-label="Select language"]'));
    expect(languageMenuButton).toBeTruthy();
  });

  it('should handle invalid auth data in localStorage', () => {
    localStorageMock.getItem.mockImplementation((key: string) => (key === 'auth' ? 'invalid-json' : 'en'));
    localStorageMock.removeItem.mockClear();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    fixture = TestBed.createComponent(MainDashboard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(consoleErrorSpy)
    expect(localStorageMock.removeItem)
    consoleErrorSpy.mockRestore();
  });
});