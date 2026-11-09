// Mirror of the extension's normalizeDomain, used for instant validation in the UI.
export function normalizeDomain(input: string): string | null {
  let v = input.trim().toLowerCase();
  if (!v) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//.test(v)) v = "https://" + v;
  let host: string;
  try {
    host = new URL(v).hostname;
  } catch {
    return null;
  }
  host = host.replace(/\.$/, "").replace(/^www\./, "");
  if (!/^(?=.{1,253}$)([a-z0-9-]{1,63}\.)+[a-z0-9-]{2,63}$/.test(host)) return null;
  return host;
}
