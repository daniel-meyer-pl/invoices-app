export function stripTags(input: any): any {
  return typeof input === 'string' ? input.replace(/<\/?[^>]+(>|$)/g, '').trim() : input
}
