// Minimal, self-contained mock data used by the curated layout components.
// This is a curated subset of the original minimal `_mock` tree.

// ----------------------------------------------------------------------

const AVATARS = Array.from(
  { length: 24 },
  (_, i) => `https://api-prod-minimal-v700.pages.dev/assets/images/avatar/avatar-${i + 1}.webp`
);

const NAMES = [
  'Jayvion Simon',
  'Lucian Obrien',
  'Deja Brady',
  'Harrison Stein',
  'Reece Chung',
  'Lainey Davidson',
  'Cristopher Cardenas',
  'Melanie Noble',
  'Chase Day',
  'Shawn Manning',
];

const COUNTRIES = ['United States', 'France', 'Japan', 'Germany', 'Korea'];

const PHONES = ['+1 202-555-0143', '+44 20 7946 0958', '+81 3-1234-5678'];

export const _mock = {
  image: {
    avatar: (index: number) => AVATARS[index % AVATARS.length],
  },
  fullName: (index: number) => NAMES[index % NAMES.length],
  phoneNumber: (index: number) => PHONES[index % PHONES.length],
  countryNames: (index: number) => COUNTRIES[index % COUNTRIES.length],
};

// ----------------------------------------------------------------------

export const _socials = [
  { value: 'facebook', label: 'Facebook', path: 'https://www.facebook.com/' },
  { value: 'instagram', label: 'Instagram', path: 'https://www.instagram.com/' },
  { value: 'linkedin', label: 'Linkedin', path: 'https://www.linkedin.com/' },
  { value: 'twitter', label: 'Twitter', path: 'https://www.x.com/' },
];

// ----------------------------------------------------------------------

export const _contacts = Array.from({ length: 8 }, (_, index) => ({
  id: `contact-${index}`,
  name: NAMES[index % NAMES.length],
  username: NAMES[index % NAMES.length].toLowerCase().replace(/\s/g, '.'),
  avatarUrl: AVATARS[index % AVATARS.length],
  email: `contact${index}@example.com`,
  phoneNumber: PHONES[index % PHONES.length],
  address: '90210 Broadway Blvd',
  status: (['online', 'offline', 'away', 'busy'] as const)[index % 4],
  role: 'Member',
  lastActivity: new Date().toISOString(),
}));

// ----------------------------------------------------------------------

export const _notifications = Array.from({ length: 6 }, (_, index) => ({
  id: `notification-${index}`,
  avatarUrl: index % 2 === 0 ? AVATARS[index % AVATARS.length] : null,
  type: (['friend', 'project', 'file', 'tags', 'payment', 'order'] as const)[index % 6],
  category: 'Communication',
  isUnRead: index < 2,
  createdAt: new Date(Date.now() - index * 3600_000).toISOString(),
  title: `<p><strong>${NAMES[index % NAMES.length]}</strong> sent you a message</p>`,
}));
