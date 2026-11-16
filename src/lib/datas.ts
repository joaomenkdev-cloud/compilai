// Formatação de datas em português, sem bibliotecas extras.

/** "agora", "há 5 min", "há 3 h", "há 2 dias" ou "12/03/2026". */
export function tempoRelativo(iso: string, agora: Date = new Date()): string {
  const segundos = Math.floor((agora.getTime() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return 'agora';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
  return dataCurta(iso);
}

/** "12/03/2026" */
export function dataCurta(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** "14:05" */
export function horaCurta(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
