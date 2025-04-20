import { ReactElement } from 'react';

interface Service {
  name: string;
  path: string;
  icon: ReactElement;
  description: string;
}

declare const ServicesPanel: () => ReactElement;

export default ServicesPanel;
