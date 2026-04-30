import type { Post, Comment, TrendingItem, Creator } from '@/app/types/dilemma'

export const FEED: Post[] = [
  {
    id: 1,
    author: { name: 'Camila Ruiz', handle: '@camila', initial: 'C' },
    posted: 'hace 2 h',
    daysLeft: 4,
    title: 'Mejor película de Spider-Man animada',
    tags: ['#cine', '#spiderverse', '#animacion'],
    a: { label: 'Into the Spider-Verse', caption: 'OPTION A · 2018 · Lord & Miller' },
    b: { label: 'Across the Spider-Verse', caption: 'OPTION B · 2023 · Dos Santos' },
    votes: { a: 8421, b: 6190 },
    likes: 14500, comments: 1240, reposts: 320, voted: null, liked: false, saved: false,
  },
  {
    id: 2,
    author: { name: 'Diego Alonso', handle: '@diego.mx', initial: 'D' },
    posted: 'hace 5 h',
    daysLeft: 2,
    title: '¿Tacos de pastor o tacos de suadero?',
    tags: ['#comida', '#cdmx', '#tacos'],
    a: { label: 'Al Pastor', caption: 'OPTION A · cerdo adobado · piña' },
    b: { label: 'Suadero', caption: 'OPTION B · res · jugoso' },
    votes: { a: 12040, b: 9821 },
    likes: 23100, comments: 3102, reposts: 891, voted: null, liked: false, saved: false,
  },
  {
    id: 3,
    author: { name: 'María Solís', handle: '@mariasol', initial: 'M' },
    posted: 'hace 1 d',
    daysLeft: 7,
    title: 'Café de olla o un buen espresso',
    tags: ['#cafe', '#mañanas'],
    a: { label: 'Café de olla', caption: 'OPTION A · piloncillo · canela' },
    b: { label: 'Espresso doble', caption: 'OPTION B · 18g · 30s' },
    votes: { a: 3402, b: 4981 },
    likes: 5830, comments: 420, reposts: 112, voted: null, liked: false, saved: false,
  },
  {
    id: 4,
    author: { name: 'Tomás Vera', handle: '@tverx', initial: 'T' },
    posted: 'hace 1 d',
    daysLeft: 3,
    title: 'Trabajar desde casa vs oficina',
    tags: ['#trabajo', '#remoto'],
    a: { label: 'Desde casa', caption: 'OPTION A · pijama · 0 commute' },
    b: { label: 'Oficina', caption: 'OPTION B · ritual · café con colegas' },
    votes: { a: 15802, b: 8340 },
    likes: 18200, comments: 2104, reposts: 543, voted: null, liked: false, saved: false,
  },
  {
    id: 5,
    author: { name: 'Paula Kahn', handle: '@paulak', initial: 'P' },
    posted: 'hace 2 d',
    daysLeft: 6,
    title: '¿Playa o montaña para las vacaciones?',
    tags: ['#viajes', '#vacaciones'],
    a: { label: 'Playa', caption: 'OPTION A · arena · mezcal · sol' },
    b: { label: 'Montaña', caption: 'OPTION B · bosque · fogata · silencio' },
    votes: { a: 6210, b: 7120 },
    likes: 9800, comments: 870, reposts: 241, voted: null, liked: false, saved: false,
  },
]

export const TRENDING: TrendingItem[] = [
  { rank: 1, title: 'iPhone vs Android', votes: '98.2K', heat: '+12%' },
  { rank: 2, title: 'Messi o Cristiano, el GOAT', votes: '76.5K', heat: '+8%' },
  { rank: 3, title: 'Libro físico o e-reader', votes: '41.0K', heat: '+22%' },
  { rank: 4, title: 'Netflix o cines los viernes', votes: '32.1K', heat: '+5%' },
  { rank: 5, title: 'Correr afuera o gimnasio', votes: '28.4K', heat: '+3%' },
]

export const CREATORS: Creator[] = [
  { name: 'Renata Flores', handle: '@rflores', initial: 'R', followers: '42.1K' },
  { name: 'Bruno Díaz',    handle: '@brunod',  initial: 'B', followers: '31.8K' },
  { name: 'Lucía Campos',  handle: '@luciacmp', initial: 'L', followers: '28.0K' },
  { name: 'Iván Ortega',   handle: '@ivano',   initial: 'I', followers: '19.4K' },
]

export const COMMENTS: Record<number, Comment[]> = {
  1: [
    { name: 'Sofía', initial: 'S', side: 'b', ts: '1 h', text: 'Across cambió el lenguaje de la animación. No hay discusión.', likes: 184 },
    { name: 'Héctor', initial: 'H', side: 'a', ts: '2 h', text: 'La primera es más limpia, más compacta. Una carta de amor al medio.', likes: 92 },
    { name: 'Nadia', initial: 'N', side: 'b', ts: '3 h', text: 'El frame-rate mixto en Across es arte puro.', likes: 57 },
  ],
  2: [
    { name: 'Pablo', initial: 'P', side: 'a', ts: '30 min', text: 'Pastor con piña y ya, no hay más que decir.', likes: 312 },
    { name: 'Ana', initial: 'A', side: 'b', ts: '1 h', text: 'Suadero bien dorado es otro nivel. Con salsa verde 🌶', likes: 204 },
  ],
}
