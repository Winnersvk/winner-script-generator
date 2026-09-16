export const profileFields = [
  ['pageName','ชื่อเพจ'],['brandName','ชื่อแบรนด์'],['facebook','Facebook'],['tiktok','TikTok'],['instagram','Instagram'],
  ['logo','URL โลโก้ (https)'],['description','คำอธิบายแบรนด์'],['language','ภาษาที่ต้องการ'],['address','ที่อยู่'],['contact','ชื่อผู้ติดต่อ'],['phone','เบอร์โทร'],['whatsapp','WhatsApp'],['messenger','Messenger'],['line','LINE'],
  ['serviceArea','พื้นที่บริการ'],['personality','บุคลิกแบรนด์'],['tone','น้ำเสียง / Tone of Voice'],['audience','กลุ่มเป้าหมาย'],
  ['product','สินค้าหรือบริการหลัก'],['cta','CTA ประจำเพจ'],['keywords','คำที่ชอบใช้'],['avoid','คำหรือสิ่งที่ห้ามพูด'],['notes','หมายเหตุ']
];
export const STORAGE_KEY = 'winner.profiles.v2';
export function normalizeProfile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('ข้อมูลโปรไฟล์ไม่ถูกต้อง');
  const result = {};
  for (const [key] of profileFields) {
    if (value[key] != null && typeof value[key] !== 'string') throw new Error('ข้อมูลโปรไฟล์ต้องเป็นข้อความ');
    result[key] = (value[key] || '').trim();
    if (result[key].length > 2000) throw new Error('แต่ละช่องต้องไม่เกิน 2,000 ตัวอักษร');
  }
  if (!result.pageName) throw new Error('กรุณากรอกชื่อเพจ');
  return result;
}
export function parseProfiles(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data?.version === 2 ? data.profiles : null;
  if (!Array.isArray(list) || list.length > 100) throw new Error('ไฟล์โปรไฟล์ไม่ถูกต้อง หรือมีเกิน 100 เพจ');
  return list.map(normalizeProfile);
}
export function profilePrompt(profile) {
  if (!profile) return 'ไม่ได้เลือกโปรไฟล์เพจ';
  const p = normalizeProfile(profile);
  return JSON.stringify(Object.fromEntries(profileFields.filter(([k])=>p[k]).map(([k,label])=>[label,p[k]])));
}
