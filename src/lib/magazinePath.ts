export const magazineListPath = '/revista';

export const magazineIssuePath = (issueNumber: number) => `/revista/${issueNumber}`;

export const magazineIssueUrl = (issueNumber: number) =>
  `${window.location.origin}${magazineIssuePath(issueNumber)}`;

export const parseMagazineRoute = (pathname = window.location.pathname) => {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === magazineListPath) return { kind: 'list' as const };
  const match = path.match(/^\/revista\/(\d+)$/);
  if (match) return { kind: 'issue' as const, issueNumber: Number(match[1]) };
  return { kind: 'other' as const };
};

export const prefersPublicMagazineLink = (link: string) => {
  const value = link.trim();
  if (!value) return true;
  if (value.includes('#magazine')) return true;
  if (value.includes('acesso-parceiro')) return true;
  return /\/revista\/\d+$/.test(value);
};
