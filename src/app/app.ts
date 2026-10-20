import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BancoSimulado, Cliente, Solicitud } from './service/service';
import { CardComponentComponent } from './shared/card-error/card.component';
import { AppUtils } from './utils/app.utils';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, CardComponentComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ias-prueba');
  private _formBuilder = inject(FormBuilder);
  loading = signal<boolean>(false);
  loadingRegister = signal<boolean>(false);
  clients = signal<Cliente[]>([]);
  solResponse = signal<Solicitud | null>(null);
  clientSelected = signal<Cliente | null>(null);
  errorMessage = signal<string | null>(null);
  errorLocation = signal<'search' | 'register' | null>(null);
  bancoService = inject(BancoSimulado);

  form = this._formBuilder.group({
    search: ['', [Validators.required, Validators.minLength(3)]],
  });

  formClientSelected = this._formBuilder.group({
    selectedCliId: ['', [Validators.required]],
    selectedCliName: ['', [Validators.required]],
    selectedCliProduct: ['', [Validators.required]],
    selectedCliCupo: [0, [Validators.required, Validators.min(1000000), Validators.max(10000000)]],
    selectedCliCheckbox: [false, [Validators.requiredTrue]],
  });

  search() {
    if (this.form.valid) {
      this.clearError();
      this.loading.set(true);
      this.clientSelected.set(null);
      this.bancoService
        .buscar(this.form.value.search ?? '')
        .then((clients: Cliente[]) => {
          this.clients.set(clients);
        })
        .catch((err) => {
          this.errorMessage.set(AppUtils.getErrorDescriptionByErrorBanco(err));
          this.errorLocation.set('search');
        })
        .finally(() => {
          this.loading.set(false);
        });
    }
  }

  selectClient(client: Cliente) {
    this.clientSelected.set(client);
    this.formClientSelected.patchValue({
      selectedCliId: client.id,
      selectedCliName: client.nombre,
      selectedCliProduct: '',
    });
    this.formClientSelected.controls.selectedCliId.disable();
    this.formClientSelected.controls.selectedCliName.disable();
  }

  registerReq() {
    if (this.formClientSelected.valid) {
      this.clearError();
      const clientId = this.clientSelected()?.id ?? '';
      const product = this.formClientSelected.value.selectedCliProduct ?? '';
      this.loadingRegister.set(true);
      this.bancoService
        .enviar({
          referencia: crypto.randomUUID(),
          clienteId: clientId,
          producto: product,
          cupo: this.formClientSelected.value.selectedCliCupo ?? 0,
          acepta: this.formClientSelected.value.selectedCliCheckbox ?? false,
        })
        .then((_solResponse: Solicitud) => {
          this.solResponse.set(_solResponse);
        })
        .catch((err) => {
          this.errorMessage.set(AppUtils.getErrorDescriptionByErrorBanco(err));
          this.errorLocation.set('register');
        })
        .finally(() => {
          this.loadingRegister.set(false);
        });
    }
  }

  newReq() {
    this.formClientSelected.patchValue({
      selectedCliId: '',
      selectedCliName: '',
      selectedCliProduct: '',
      selectedCliCupo: 0,
      selectedCliCheckbox: false,
    });
    this.clientSelected.set(null);
  }

  clearError() {
    this.errorMessage.set(null);
    this.errorLocation.set(null);
  }
}
