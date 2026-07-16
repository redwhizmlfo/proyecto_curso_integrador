import cascoImg from '../assets/casco.png';
import esmerilGws2200Img from '../assets/esmeril_gws2200.png';
import esmerilGws750Img from '../assets/esmeril_gws750.png';
import interruptorImg from '../assets/interruptor.png';
import pernosImg from '../assets/pernos.png';
import rotomartilloBoschImg from '../assets/rotomartillo_bosch.png';
import taladroImg from '../assets/taladro.png';
import taladroDewaltImg from '../assets/taladro_dewalt.png';

const catalogAssetMap = {
  'casco.png': cascoImg,
  'esmeril_gws2200.png': esmerilGws2200Img,
  'esmeril_gws750.png': esmerilGws750Img,
  'interruptor.png': interruptorImg,
  'pernos.png': pernosImg,
  'rotomartillo_bosch.png': rotomartilloBoschImg,
  'taladro.png': taladroImg,
  'taladro_dewalt.png': taladroDewaltImg,
};

export const resolveCatalogImageUrl = (url, fallback = taladroImg) => {
  const cleanUrl = String(url || '').trim();
  if (!cleanUrl) return fallback;

  const fileName = cleanUrl.split('/').pop();
  if (catalogAssetMap[fileName]) return catalogAssetMap[fileName];

  return cleanUrl;
};

export const catalogImageFallback = taladroImg;
