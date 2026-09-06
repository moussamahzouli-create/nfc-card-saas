export interface TemplateConfiguration {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  borderRadius: string; // e.g. "12px", "24px", "0px"
  fontFamily: string; // e.g. "Inter", "Outfit", "Courier Prime"
  buttonStyle: 'SOLID' | 'OUTLINE' | 'GLASS' | 'SHADOW';
  spacing: 'TIGHT' | 'NORMAL' | 'LOOSE';
  headerStyle: 'CENTER' | 'LEFT' | 'GLASS_BANNER';
  backgroundStyle: 'SOLID' | 'GRADIENT' | 'MESH';
}
