/**
 * A light, best-effort read of browser + OS from `navigator.userAgent`
 * — just enough for "Chrome no Windows"-style copy in Sessões e
 * dispositivos. Deliberately not a full UA-parsing library: nothing
 * here needs to be exact, only honest about what it can tell.
 */
export function detectDeviceLabel(userAgent: string): string {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'Navegador desconhecido';

  // iOS user agents include "like Mac OS X" for legacy compatibility —
  // checked before the real macOS pattern, or every iPhone/iPad would
  // misreport as "macOS".
  const os = /Windows/.test(userAgent)
    ? 'Windows'
    : /iPhone|iPad|iOS/.test(userAgent)
      ? 'iOS'
      : /Mac OS X/.test(userAgent)
        ? 'macOS'
        : /Android/.test(userAgent)
          ? 'Android'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'sistema desconhecido';

  return `${browser} em ${os}`;
}
