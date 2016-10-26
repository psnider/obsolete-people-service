import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 |  exponentialStrength:10}}
 *   formats to: 1024
*/
@Pipe({name: 'truncateLeadingChars'})
export class TruncateLeadingCharsPipe implements PipeTransform {
  transform(s: string, max_chars_arg: number): string {
    let max_chars = (max_chars_arg != null) ? max_chars_arg : 4
    let s_len = s.length
    if (s_len <= max_chars) {
        return s
    } else {
        return `...${s.slice(s_len-max_chars)}`
    }
  }
}
