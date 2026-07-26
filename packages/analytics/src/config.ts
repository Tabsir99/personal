export interface ScriptConfig {
  allowFileProtocol: boolean;
  allowLocalhost: boolean;
  debug: boolean;
  disableConsole: boolean;
  websiteId: string | null;
  domain: string | null;
  allowedHostnames: string[];
  apiUrlRaw: string | null;
}

export const scriptTag = typeof document !== 'undefined' ? (document.currentScript as HTMLScriptElement | null) : null;

const getAttr = scriptTag ? scriptTag.getAttribute.bind(scriptTag) : () => null;

export const config: ScriptConfig = {
  allowFileProtocol: getAttr('data-allow-file-protocol') === 'true',
  allowLocalhost: getAttr('data-allow-localhost') === 'true',
  debug: getAttr('data-debug') === 'true',
  disableConsole: getAttr('data-disable-console') === 'true',
  websiteId: getAttr('data-website-id'),
  domain: getAttr('data-domain'),
  allowedHostnames: getAttr('data-allowed-hostnames')
    ? getAttr('data-allowed-hostnames')!
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [],
  apiUrlRaw: getAttr('data-api-url'),
};

/** Programmatically override config values (used by SDK mode). */
export function setConfig(overrides: Partial<ScriptConfig>) {
  Object.assign(config, overrides);
}
