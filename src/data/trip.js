// 行程基础信息。改日期、人数、默认汇率都在这里。
export const TRIP = {
  title: '美东圣诞篮球行',
  titleEn: 'EAST COAST HOOPS',
  start: '2026-12-18',
  end: '2026-12-31',
  people: 2,
  nights: 13,
  checkedOn: '2026-11-05'
};

// 城市：颜色用于占位图和路线图；气温/日落是 12 月下旬历史平均
export const CITIES = {
  bos: { zh: '波士顿', en: 'Boston', hi: 4, lo: -4, sunset: '16:15' },
  dc:  { zh: '华盛顿', en: 'Washington, DC', hi: 8, lo: 0, sunset: '16:50' },
  phl: { zh: '费城', en: 'Philadelphia', hi: 7, lo: -1, sunset: '16:40' },
  nyc: { zh: '纽约', en: 'New York', hi: 6, lo: -1, sunset: '16:30' },
  la:  { zh: '洛杉矶', en: 'Los Angeles', hi: 19, lo: 9, sunset: '16:55' }
};

export const CATEGORIES = {
  sight: '景点',
  food: '美食',
  arena: '球馆',
  hub: '交通枢纽',
  shop: '纪念品'
};
