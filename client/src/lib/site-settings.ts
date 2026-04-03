export interface SiteSettings {
  name: string;
  logo: string;
  favicon: string;
  titleFontSize: number;
  backgroundColor: string;
  companyIntro: string;
  icp: string;
  email: string;
  customerServiceQrCode: string;
  termsText: string;
  privacyText: string;
  aboutContent: string;
  partnersContent: string;
}

export const DEFAULT_SITE_NAME = "智能零零AI工具";
export const SITE_SETTINGS_CACHE_KEY = "site-settings-cache:v1";

const DEFAULT_BACKGROUND_COLOR = "#f5f5f7";

const toStringValue = (value: unknown) => (typeof value === "string" ? value : "");

const toNumberValue = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeSiteSettings = (value?: Partial<SiteSettings> | null): SiteSettings => {
  const siteName = toStringValue(value?.name).trim();

  return {
    name: siteName || DEFAULT_SITE_NAME,
    logo: toStringValue(value?.logo),
    favicon: toStringValue(value?.favicon),
    titleFontSize: toNumberValue(value?.titleFontSize, 17),
    backgroundColor: toStringValue(value?.backgroundColor) || DEFAULT_BACKGROUND_COLOR,
    companyIntro: toStringValue(value?.companyIntro),
    icp: toStringValue(value?.icp),
    email: toStringValue(value?.email),
    customerServiceQrCode: toStringValue(value?.customerServiceQrCode),
    termsText: toStringValue(value?.termsText),
    privacyText: toStringValue(value?.privacyText),
    aboutContent: toStringValue(value?.aboutContent),
    partnersContent: toStringValue(value?.partnersContent),
  };
};

export const readCachedSiteSettings = () => {
  if (typeof window === "undefined") return normalizeSiteSettings();

  try {
    const cached = window.localStorage.getItem(SITE_SETTINGS_CACHE_KEY);
    return cached ? normalizeSiteSettings(JSON.parse(cached)) : normalizeSiteSettings();
  } catch {
    return normalizeSiteSettings();
  }
};

export const cacheSiteSettings = (value?: Partial<SiteSettings> | null) => {
  const normalized = normalizeSiteSettings(value);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SITE_SETTINGS_CACHE_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore storage write failures and keep runtime state usable.
    }
  }

  return normalized;
};

export const fetchSiteSettings = async () => {
  const response = await fetch("/api/settings");

  if (!response.ok) {
    let message = "加载站点设置失败";

    try {
      const payload = await response.json();
      if (payload?.error) message = String(payload.error);
    } catch {
      // Ignore invalid error payloads and use the fallback message.
    }

    throw new Error(message);
  }

  return cacheSiteSettings(await response.json());
};

export const getSiteName = (settings?: Partial<SiteSettings> | null) => normalizeSiteSettings(settings).name;

export const getFrontendDocumentTitle = (settings?: Partial<SiteSettings> | null) => getSiteName(settings);

export const getAdminDocumentTitle = (settings?: Partial<SiteSettings> | null) => `${getSiteName(settings)} - 管理后台`;