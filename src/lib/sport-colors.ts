export type SportType = 'PICKLEBALL' | 'TENNIS' | 'PADEL';

export interface SportColors {
  label: string;
  badgeColor: string;
  badgeBg: string;
  buttonColor: string;
}

export function getSportColors(sport: SportType | string | undefined): SportColors {
  switch (sport?.toUpperCase()) {
    case 'PICKLEBALL':
      return {
        label: 'Pickleball',
        badgeColor: '#7C3AED', // Purple
        badgeBg: '#F3E8FF',
        buttonColor: '#7C3AED',
      };
    case 'TENNIS':
      return {
        label: 'Tennis',
        badgeColor: '#059669', // Green
        badgeBg: '#ECFDF5',
        buttonColor: '#059669',
      };
    case 'PADEL':
      return {
        label: 'Padel',
        badgeColor: '#2563EB', // Blue
        badgeBg: '#EFF6FF',
        buttonColor: '#2563EB',
      };
    default:
      return {
        label: sport || 'Sport',
        badgeColor: '#6B7280', // Gray
        badgeBg: '#F3F4F6',
        buttonColor: '#6B7280',
      };
  }
}
