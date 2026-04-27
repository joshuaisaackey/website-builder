export type MenuItem = {
  name: string;
  price: string;
};

export type BusinessSiteData = {
  id?: string;
  slug?: string;
  business_name: string;
  business_type: string;
  description: string;
  domain: string;
  city: string;
  phone: string;
  services: string[];
  menu_items: MenuItem[];
};

export type BusinessRecord = BusinessSiteData & {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type BusinessFormPayload = {
  id?: string;
  businessName: string;
  businessType: string;
  description: string;
  domain: string;
  city: string;
  phone: string;
  services: string[];
  menuItems: MenuItem[];
};
