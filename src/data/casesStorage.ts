import { CASES } from "./cases";

export const CMS_DATA_KEY = "cases_cms_data";

export type CaseItem = {
  title: string;
  description: string;
  tags: string[];
  year: string;
  hidden?: boolean;
};

export function loadCases(): CaseItem[] {
  try {
    const raw = localStorage.getItem(CMS_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [...CASES];
}

/** For the site: only projects that are not hidden */
export function loadCasesForSite(): CaseItem[] {
  return loadCases().filter((c) => !c.hidden);
}

export function saveCases(cases: CaseItem[]) {
  localStorage.setItem(CMS_DATA_KEY, JSON.stringify(cases));
}
