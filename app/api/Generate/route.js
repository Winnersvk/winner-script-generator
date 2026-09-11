import OpenAI from 'openai';

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    directions: {
      type: 'array', minItems: 3, maxItems: 3,
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          mode: {type:'string'}, title:{type:'string'}, angle:{type:'string'},
          hooks:{type:'array',minItems:3,maxItems:3,items:{type:'string'}},
          script:{type:'string'},
          textOnScreen:{type:'array',minItems:3,maxItems:6,items:{type:'string'}},
          coverHooks:{type:'array',minItems:3,maxItems:3,items:{type:'string'}},
          caption:{type:'string'},
          broll:{type:'array',minItems:4,maxItems:10,items:{type:'string'}},
          cta:{type:'string'}
        },
        required:['mode','title','angle','hooks','script','textOnScreen','coverHooks','caption','broll','cta']
      }
    }
  },
  required:['directions']
};

export async function POST(req){
  try{
    if(!process.env.OPENAI_API_KEY){
      return Response.json({error:'ยังไม่ได้ตั้งค่า OPENAI_API_KEY ในไฟล์ .env.local'},{status:500});
    }
    const x = await req.json();
    const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const model = process.env.OPENAI_MODEL || 'gpt-5.6';
    const instructions = `คุณคือ Senior Short-form Video Scriptwriter สำหรับ TikTok, Facebook Reels และ Instagram Reels เชี่ยวชาญ Storytelling สำหรับ SME และเจ้าของธุรกิจในไทย/ลาว

หลักสำคัญ:
- เปลี่ยนข้อมูลดิบให้เป็นเรื่องเล่า ไม่ใช่โฆษณาแข็งๆ
- Hook 0-3 วินาทีต้องดึงที่สุด ใช้ปัญหา ความเข้าใจผิด ผลลัพธ์ หรือหักมุมก่อนการเกริ่น
- Story Arc: Hook → Setup → Problem → Turning Point → Solution → Result → Key Message/CTA
- สินค้าเป็นคำตอบของปัญหาอย่างเป็นธรรมชาติ ไม่ยัดขาย
- ห้ามสร้างตัวเลข ยอดขาย รีวิว หรือผลลัพธ์ที่ผู้ใช้ไม่ได้ให้
- ถ้าข้อมูลบางช่องว่าง ให้ตีความจาก story เท่าที่มี ห้ามแต่งข้อเท็จจริง
- ภาษาลาวต้องเป็นภาษาพูดธรรมชาติของคนลาว ไม่แปลไทยคำต่อคำ ประโยคสั้น อ่านหน้ากล้องง่าย
- ความยาว script ต้องใกล้เวลาที่กำหนดและพูดจริงได้
- สร้าง 3 directions ที่แตกต่างกันชัดเจน: A = เล่าเรื่องจริงใจ, B = Hook แรง/Retention สูง, C = Story + Soft Sell เว้นแต่ style ที่ผู้ใช้เลือกควรมีการปรับให้เหมาะ
- Cover Hook ต้องสั้นและคลิกอยากดู
- B-roll ต้องทำได้จริงด้วยมือถือ/CapCut
`;

    const input = `สร้างคอนเทนต์จากข้อมูลนี้\n\nหัวข้อ: ${x.topic||'-'}\nสินค้า/บริการ: ${x.product||'-'}\nเรื่องราวดิบ: ${x.story||'-'}\nปัญหา: ${x.problem||'-'}\nจุดเปลี่ยน: ${x.turningPoint||'-'}\nวิธีแก้: ${x.solution||'-'}\nผลลัพธ์: ${x.result||'-'}\nKey Message: ${x.keyMessage||'-'}\nกลุ่มเป้าหมาย: ${x.audience||'-'}\nความยาว: ${x.duration||40} วินาที\nภาษา: ${x.language||'ลาว'}\nเป้าหมาย: ${x.goal||'-'}\nสไตล์หลัก: ${x.style||'Storytelling จริงใจ'}\nประเภท Hook: ${x.hookType||'AI เลือกให้อัตโนมัติ'}\n\nใน field script ให้ใส่ timecode ช่วงสำคัญ เช่น [0–3 ວິ | HOOK] หรือ [0–3 วิ | HOOK] ให้ตรงกับภาษาที่เลือก`;

    const response = await client.responses.create({
      model,
      instructions,
      input,
      store:false,
      text:{
        format:{type:'json_schema',name:'script_generator_output',strict:true,schema}
      }
    });
    const parsed = JSON.parse(response.output_text);
    return Response.json(parsed);
  }catch(err){
    console.error(err);
    return Response.json({error:err?.message || 'เกิดข้อผิดพลาดจากระบบ AI'},{status:500});
  }
}
