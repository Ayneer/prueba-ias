import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { BancoSimulado, Cliente } from './service/service';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let bancoService: jasmine.SpyObj<BancoSimulado>;

  const clientesMock = [
    {
      id: '123',
      nombre: 'Carlos Pérez',
    },
    {
      id: '456',
      nombre: 'Carolina Gómez',
    },
  ] as Cliente[];

  beforeEach(async () => {
    bancoService = jasmine.createSpyObj<BancoSimulado>('BancoSimulado', ['buscar']);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: BancoSimulado, useValue: bancoService }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('form is invalid when any required input is empty', () => {
    component.form.controls.search.setValue('');
    expect(component.form.invalid).toBeTrue();
  });

  it('form is invalid when search input has tow o less characters', () => {
    component.form.controls.search.setValue('ab');
    expect(component.form.invalid).toBeTrue();
  });

  it('form is valid when search input has three o more characters', () => {
    component.form.controls.search.setValue('abc');
    expect(component.form.valid).toBeTrue();
  });

  it('not call the bank service when search input is bad', () => {
    component.form.controls.search.setValue('ab');
    component.search();
    expect(bancoService.buscar).not.toHaveBeenCalled();
  });

  it('should return the clients mocks', async () => {
    bancoService.buscar.and.returnValue(Promise.resolve(clientesMock));

    component.form.controls.search.setValue('Carlos');
    component.search();

    expect(component.loading()).toBeTrue();

    await fixture.whenStable();

    expect(bancoService.buscar).toHaveBeenCalledWith('Carlos');
    expect(component.clients()).toEqual(clientesMock);
    expect(component.loading()).toBeFalse();
  });

  it('should return empty list when search filter is not cast whit any client', async () => {
    bancoService.buscar.and.returnValue(Promise.resolve([]));

    component.form.controls.search.setValue('XYZ');
    component.search();

    await fixture.whenStable();

    expect(component.clients()).toEqual([]);
    expect(component.loading()).toBeFalse();
  });

  it('should return a error', async () => {
    bancoService.buscar.and.returnValue(Promise.reject(new Error('Error de conexión')));

    component.form.controls.search.setValue('Carlos');
    component.search();

    await fixture.whenStable();

    expect(component.loading()).toBeFalse();
    expect(component.errorLocation()).toBe('search');
    expect(component.errorMessage()).toBeTruthy();
  });
});
