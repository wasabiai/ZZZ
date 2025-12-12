import { StyleTemplate, AspectRatio, ProductAngle, LayoutTemplate } from './types';

export const PRESET_STYLES: StyleTemplate[] = [
  {
    id: 'hotel-luxury',
    name: '五星飯店・奢華白 (Luxury Hotel)',
    description: '場景：頂級飯店衛浴。大理石牆面、無邊框玻璃、明亮通透，強調潔具的純淨與高級感。',
    prompt: 'High-end 5-star hotel bathroom interior. Background: White Carrara marble walls, frameless glass shower enclosure, large illuminated vanity mirror. Lighting: Bright, airy, cool-toned professional interior lighting, sparkling chrome reflections. Atmosphere: Hygienic, expensive, spacious, pristine cleanliness. The product is the centerpiece of a luxury vanity area.',
    tags: ['大理石', '飯店', '明亮'],
    previewColor: '#F5F5F5'
  },
  {
    id: 'japanese-zen',
    name: '侘寂・衛浴美學 (Wabi-Sabi)',
    description: '場景：微水泥與萊姆石構成的靜謐空間。強調檯面乾淨無雜物(不擺放植物)，光影協調柔和。',
    prompt: 'High-end Wabi-Sabi bathroom aesthetic, luxury spa environment. Background: Textured micro-cement walls, matte limestone floor, stone textures. Lighting: Perfectly coordinated soft diffused light, calm and moody atmosphere, gentle shadows, subtle steam vibe. Composition: Ultra-minimalist, keeping the product surface strictly CLEAN and EMPTY (NO plants, NO vases, NO clutter on top of the cabinet/product). Focus on material textures, earthy beige and grey tones, architectural silence.',
    tags: ['微水泥', '靜謐', '無雜物'],
    previewColor: '#A8A29E'
  },
  {
    id: 'nordic-wood',
    name: '北歐・暖木衛浴 (Nordic)',
    description: '場景：淺色木紋與白磚搭配的溫馨浴室。陽光灑落，適合家庭與收納型產品。',
    prompt: 'Scandinavian nordic bathroom design. Background: Light oak wood vanity cabinets, matte white subway tiles or hexagonal floor tiles. Lighting: Natural morning sunlight streaming through a frosted window, soft warm glow. Atmosphere: Cozy, functional, family-friendly, hygienic, organic simplicity.',
    tags: ['淺木', '白磚', '溫馨'],
    previewColor: '#E0E0E0'
  },
  {
    id: 'modern-industrial',
    name: '現代・工業灰 (Industrial)',
    description: '場景：清水模質感、黑色五金。適合展現個性化、線條俐落的衛浴單品。',
    prompt: 'Modern industrial loft bathroom. Background: Raw concrete (beton brut) walls, dark grey slate flooring. Accents: Matte black fixtures, steel pipes, frameless mirror. Lighting: Dramatic, slightly cool artificial lighting, high contrast shadows. Atmosphere: Masculine, sleek, architectural, edgy.',
    tags: ['清水模', '黑五金', '個性'],
    previewColor: '#607D8B'
  },
  {
    id: 'taiwan-retro',
    name: '台式・復古浴室 (Retro TW)',
    description: '場景：阿嬤家的浴室美學。綠白馬賽克小方磚、海棠花玻璃，懷舊而時髦。',
    prompt: 'Vintage Taiwanese bathroom aesthetic (1980s style). Background: Classic small mosaic tiles (green and white color scheme), patterned glass window (begonia flower pattern), terrazzo flooring. Lighting: Warm tungsten nostalgic glow. Atmosphere: Retro-chic, cultural, nostalgic, Wong Kar-wai cinematic vibe.',
    tags: ['馬賽克磚', '復古', '懷舊'],
    previewColor: '#4DB6AC'
  },
  {
    id: 'k-cream',
    name: '韓系・奶油風 (Cream Style)',
    description: '場景：IG網美風浴室。米色/奶油色系水磨石、圓弧線條，柔和夢幻。',
    prompt: 'Trendy Korean aesthetic bathroom. Background: Cream and beige terrazzo tiles, curved architectural details, arched mirrors. Lighting: Very soft, diffuse, low contrast "Instagram filter" look, pastel tones. Atmosphere: Dreamy, soft, feminine, minimalist lifestyle.',
    tags: ['奶油色', '水磨石', '柔美'],
    previewColor: '#FFF3E0'
  },
  {
    id: 'dark-moody',
    name: '暗調・豪宅黑廁 (Dark Luxury)',
    description: '場景：豪宅客用衛浴。黑色石材、間接照明、金色五金，戲劇性光影。',
    prompt: 'Ultra-luxury dark powder room. Background: Black Nero Marquina marble or dark slate walls, brass or gold fixtures context. Lighting: Moody, dramatic chiaroscuro, hidden LED strip lighting, spotlight on the product. Atmosphere: Mysterious, expensive, exclusive, high-contrast.',
    tags: ['暗黑', '金色', '奢華'],
    previewColor: '#212121'
  },
  {
    id: 'nature-spa',
    name: '自然・森林系 (Nature Spa)',
    description: '場景：半戶外或大窗景浴室。窗外有綠植，強調與自然的連結，SPA度假感。',
    prompt: 'Nature-inspired spa bathroom. Background: Large window overlooking a tropical garden or bamboo forest, natural stone elements. Lighting: Dappled sunlight through leaves, fresh and organic. Atmosphere: Relaxing, retreat, wellness, breathing, connected to nature.',
    tags: ['綠意', '窗景', '度假'],
    previewColor: '#81C784'
  },
  {
    id: 'studio-clean',
    name: '極簡・純白攝影棚 (Studio)',
    description: '場景：無縫純白背景。模擬專業商攝棚拍，強調釉面光澤與產品細節。',
    prompt: 'Professional sanitary ware studio photography. Background: Infinite pure white cyclorama. Lighting: Calculated studio strobe lighting to highlight ceramic glaze and chrome reflections perfectly. Atmosphere: Clinical, sharp, product-focused, catalog style.',
    tags: ['純白', '商攝', '專業'],
    previewColor: '#FFFFFF'
  },
  {
    id: 'muji-style',
    name: '日式・無印極簡 (MUJI Style)',
    description: '場景：純白背景、橡木收納。強調實用與「剛剛好」的生活哲學，整潔明亮。',
    prompt: 'Japanese MUJI style bathroom interior. Background: Pure white smooth walls, light oak wood shelving units, rattan storage baskets, beige cotton towels. Lighting: Bright, even natural daylight, soft and functional. Atmosphere: Organized, practical, "just enough" philosophy, minimalist daily life, clean and warm.',
    tags: ['無印', '純白', '實用'],
    previewColor: '#D7CCC8'
  }
];

export const ASPECT_RATIOS = [
  { label: '方形 (IG Post)', value: AspectRatio.Square },
  { label: '直式海報 (Poster)', value: AspectRatio.Portrait },
  { label: '限動滿版 (9:16)', value: AspectRatio.Story },
  { label: '橫式 (Web)', value: AspectRatio.Wide },
];

export const PRODUCT_ANGLES = [
  { label: '正視 (Front)', value: ProductAngle.Front },
  { label: '左前側 (Left 45°)', value: ProductAngle.Left },
  { label: '右前側 (Right 45°)', value: ProductAngle.Right },
  { label: '上視 (Top)', value: ProductAngle.Top },
];

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
    // MUJI Style (Minimalist)
    { id: 'muji-1', name: '極簡・留白', category: 'muji', iconColor: '#E6E0D4' },
    { id: 'muji-2', name: '極簡・圖文', category: 'muji', iconColor: '#DCD3C7' },
    { id: 'muji-3', name: '極簡・細節', category: 'muji', iconColor: '#EDE8E1' },
    
    // Uniqlo Style (Blocky, Bold)
    { id: 'uniqlo-1', name: '促銷・大標題', category: 'uniqlo', iconColor: '#FFEBEE' },
    { id: 'uniqlo-2', name: '促銷・紅底', category: 'uniqlo', iconColor: '#FFCDD2' },
    { id: 'uniqlo-3', name: '促銷・型錄', category: 'uniqlo', iconColor: '#EF9A9A' },

    // Editorial / Modern
    { id: 'edit-1', name: '雜誌・跨頁', category: 'editorial', iconColor: '#F3E5F5' },
    { id: 'edit-2', name: '雜誌・標題', category: 'editorial', iconColor: '#E1BEE7' },
];