export type Cliente = { id: string; nombre: string };
export type Solicitud = {
  numero: string;
  referencia: string;
  clienteId: string;
  producto: string;
  cupo: number;
  estado: 'RECIBIDA';
};
export type Entrada = {
  referencia: string;
  clienteId: string;
  producto: string;
  cupo: number;
  acepta: boolean;
};
export class ErrorBanco extends Error {
  constructor(public codigo: string) {
    super(codigo);
  }
}
const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));
// Una instancia por sesión de la aplicación. Solo datos ficticios.

export class BancoSimulado {
  private clientes: Cliente[] = Array.from({ length: 5000 }, (_, i) => ({
    id: String(i + 1).padStart(6, '0'),
    nombre: `Cliente de prueba ${i + 1}`,
  }));
  private gestiones = new Map<string, Solicitud>();
  private entradas = new Map<string, string>();
  private primerEnvio = true;

  async buscar(texto: string): Promise<Cliente[]> {
    const q = texto.trim();
    await esperar(q.length <= 3 ? 900 : 150);
    if (q === '999') throw new ErrorBanco('NO_DISPONIBLE');
    if (q.length < 3) return [];
    return this.clientes
      .filter((c) => c.id.includes(q) || c.nombre.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 20);
  }

  async enviar(e: Entrada): Promise<Solicitud> {
    const firma = JSON.stringify([e.clienteId, e.producto, e.cupo, e.acepta]);
    if (
      !e.referencia ||
      !this.clientes.some((c) => c.id === e.clienteId) ||
      !['CLASICA', 'ORO'].includes(e.producto) ||
      !Number.isInteger(e.cupo) ||
      e.cupo < 1000000 ||
      e.cupo > 10000000 ||
      e.acepta !== true
    ) {
      await esperar(100);
      throw new ErrorBanco('DATOS_INVALIDOS');
    }
    const anterior = this.gestiones.get(e.referencia);
    if (anterior) {
      await esperar(150);
      if (this.entradas.get(e.referencia) !== firma)
        throw new ErrorBanco('REFERENCIA_CON_OTROS_DATOS');
      return { ...anterior };
    }
    const s: Solicitud = {
      numero: `TC-${this.gestiones.size + 1}`,
      referencia: e.referencia,
      clienteId: e.clienteId,
      producto: e.producto,
      cupo: e.cupo,
      estado: 'RECIBIDA',
    };
    this.gestiones.set(e.referencia, s);
    this.entradas.set(e.referencia, firma);
    const perderRespuesta = this.primerEnvio;
    this.primerEnvio = false;
    await esperar(600);
    if (perderRespuesta) throw new ErrorBanco('SIN_CONFIRMACION');
    return { ...s };
  }
}
