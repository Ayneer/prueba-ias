import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Solicitud } from '../../service/service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'card-component',
  templateUrl: './card.component.html',
  imports: [],
  styleUrl: './card.component.scss',
})
export class CardComponentComponent {
  title = input.required<string>();
  type = input.required<'success' | 'error'>();
  solResponse = input<Solicitud | null>();
  description = input<string>('');
}
