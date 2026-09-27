import { format, isValid, parseISO } from 'date-fns';

import { isHttpUrl } from '@/shared/links/httpLink';

import { getPlaceCategoryLabel } from '../constants/placeCategories';
import type { DurationType, LeisureItem, LeisurePriority } from '../types/leisureItem.types';
import { formatDuration } from './durationFormat';

export interface ItemDetailRow {
  label: string;
  value: string;
  /** Set when the value is an http(s) link, rendered as a clickable anchor. */
  href?: string;
}

const priorityLabels: Record<LeisurePriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const durationTypeLabels: Record<DurationType, string> = {
  fixed: 'Fixa',
  flexible: 'Flexível',
  unknown: 'Não sei',
};

const musicKindLabels = {
  album: 'Álbum',
  playlist: 'Playlist',
  track: 'Faixa',
  other: 'Outro',
} as const;

function formatDate(value: string): string | undefined {
  const date = parseISO(value);
  return isValid(date) ? format(date, 'dd/MM/yyyy') : undefined;
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** "3 de 10", "3" or "de 10", from an optional current/total pair. */
function formatOfTotal(current?: number, total?: number): string | undefined {
  if (current !== undefined && total !== undefined) return `${current} de ${total}`;
  if (current !== undefined) return String(current);
  if (total !== undefined) return `de ${total}`;
  return undefined;
}

function link(label: string, url?: string): ItemDetailRow | undefined {
  if (!url) return undefined;
  return isHttpUrl(url) ? { label, value: url, href: url } : { label, value: url };
}

/** Per-type fields, with the same labels the item form uses. */
function typeSpecificRows(item: LeisureItem): (ItemDetailRow | undefined)[] {
  const row = (label: string, value: string | number | undefined): ItemDetailRow | undefined =>
    value === undefined || value === '' ? undefined : { label, value: String(value) };

  switch (item.type) {
    case 'movie':
      return [
        row('Duração do filme', item.movie.runtime && formatDuration(item.movie.runtime)),
        row('Ano de lançamento', item.movie.releaseYear),
        row('Gêneros', item.movie.genres?.join(', ')),
      ];
    case 'tvShow':
      return [
        row('Temporada', formatOfTotal(item.tvShow.currentSeason, item.tvShow.totalSeasons)),
        row(
          'Episódio',
          formatOfTotal(item.tvShow.currentEpisode, item.tvShow.totalEpisodesInSeason),
        ),
        row('Gêneros', item.tvShow.genres?.join(', ')),
      ];
    case 'book':
      return [row('Autor', item.book.author), row('Páginas', item.book.pages)];
    case 'audiobook':
      return [
        row('Autor', item.audiobook.author),
        row('Narrador', item.audiobook.narrator),
        row(
          'Duração total',
          item.audiobook.totalMinutes && formatDuration(item.audiobook.totalMinutes),
        ),
      ];
    case 'game':
      return [row('Plataforma', item.game.platform), row('Horas jogadas', item.game.hoursPlayed)];
    case 'podcast':
      return [
        row('Episódio', formatOfTotal(item.podcast.currentEpisode, item.podcast.totalEpisodes)),
      ];
    case 'music':
      return [
        row('Artista', item.music.artist),
        row('Álbum', item.music.album),
        row('Formato', item.music.kind && musicKindLabels[item.music.kind]),
      ];
    case 'article':
      return [
        row(
          'Tempo de leitura',
          item.article.estimatedReadMinutes && formatDuration(item.article.estimatedReadMinutes),
        ),
      ];
    case 'place':
      return [
        row('Categoria', item.place.category && getPlaceCategoryLabel(item.place.category)),
        row('Endereço', item.place.address),
        row('Cidade', item.place.city),
      ];
    case 'event': {
      const ticket = item.event.ticket;
      return [
        row('Data', item.event.date && formatDate(item.event.date)),
        row('Horário', item.event.time),
        row('Local', item.event.location),
        row(
          'Ingresso',
          ticket?.purchased === undefined ? undefined : ticket.purchased ? 'Comprado' : 'A comprar',
        ),
        row('Preço', ticket?.price === undefined ? undefined : formatPrice(ticket.price)),
        link('Link do ingresso', ticket?.ticketUrl),
      ];
    }
    case 'hobby':
      return [
        row('Começou em', item.hobby.startedAt && formatDate(item.hobby.startedAt)),
        row(
          'Duração da sessão',
          item.hobby.estimatedSessionDuration &&
            formatDuration(item.hobby.estimatedSessionDuration),
        ),
      ];
    default:
      return [];
  }
}

/**
 * The item's filled-in fields for the detail page's "Detalhes" block —
 * only what has a value, so an item with little data shows a short list
 * instead of a wall of "—". Tags are rendered separately, as chips.
 */
export function getItemDetailRows(item: LeisureItem): ItemDetailRow[] {
  const rows: (ItemDetailRow | undefined)[] = [
    ...typeSpecificRows(item),
    item.priority ? { label: 'Prioridade', value: priorityLabels[item.priority] } : undefined,
    item.estimatedDuration
      ? { label: 'Duração estimada', value: formatDuration(item.estimatedDuration) }
      : undefined,
    item.durationType !== 'unknown'
      ? { label: 'Tipo de duração', value: durationTypeLabels[item.durationType] }
      : undefined,
    item.minimumUsefulDuration
      ? { label: 'Sessão mínima útil', value: formatDuration(item.minimumUsefulDuration) }
      : undefined,
    item.source ? { label: 'Fonte', value: item.source } : undefined,
    link('Link', item.sourceUrl),
    item.recommendedBy ? { label: 'Recomendado por', value: item.recommendedBy } : undefined,
  ];
  return rows.filter((row): row is ItemDetailRow => Boolean(row));
}
