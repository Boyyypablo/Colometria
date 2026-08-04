/**
 * Fotos Unsplash — cada URL usada uma única vez.
 * Alta resolução; o next/image cuida do DPR (não use dpr= na URL).
 */
const u = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=90`;

export const LANDING_IMAGES = {
  /** Hero local — rostos com maquiagem colorida (arquivo do usuário) */
  hero: "/landing/hero-faces.png",
  /** Rosto limpo, luz natural */
  about: u("photo-1531746020798-e6953c6e8e04", 1800),
  /** Pele / cuidado — composição calma */
  services: u("photo-1570172619644-dfd03ed5d881", 2000),
  /** Detalhe de cor (batom) */
  servicesInset: u("photo-1596462502278-27bfdc403348", 1600),
  /** Galeria: 4 retratos distintos */
  gallery: [
    u("photo-1534528741775-53994a69daeb", 1600),
    u("photo-1544005313-94ddf0286df2", 1600),
    u("photo-1494790108377-be9c29b29330", 1600),
    u("photo-1438761681033-6461ffad8d80", 1600),
  ],
  /** Retrato elegante para CTA */
  cta: u("photo-1524504388940-b1c1722653e1", 2560),
} as const;

/** Qualidade padrão do next/image na landing */
export const LANDING_IMAGE_QUALITY = 92;
