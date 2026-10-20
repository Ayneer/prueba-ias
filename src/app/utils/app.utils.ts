import { ErrorBanco } from '../service/service';

export class AppUtils {
  static getErrorDescriptionByErrorBanco(errorBanco: ErrorBanco): string {
    switch (errorBanco.codigo) {
      default:
      case 'NO_DISPONIBLE':
        return 'Lo sentimos, por ahora el servicio no se encuentra disponible, por favor intente mas tarde';

      case 'DATOS_INVALIDOS':
        return 'Por favor verifique los datos ingresados y vuelva a intentar';

      case 'REFERENCIA_CON_OTROS_DATOS':
        return 'Los datos ingresados ya se encuentra en nuestro sistema, por favor espere la respuesta o intente mas tarde.';

    case 'SIN_CONFIRMACION':
        return 'Lo sentimos, por ahora el servicio sufrió un reajuste, Por favor intente nuevamente.';
    }
  }
}
