// Server-only integration boundary. Not exposed by a route until page authorization
// and a durable worker are configured. Never return/log access tokens or raw errors.
export class MetaPublishError extends Error {
 constructor(message,{uncertain=false,code=null}={}){super(message);this.name='MetaPublishError';this.uncertain=uncertain;this.code=code;}
}
export async function publishFacebook({pageId,accessToken,version,caption,imageUrls},fetcher=fetch){
 if(!/^\d+$/.test(pageId||'')||!accessToken||!/^v\d+\.\d+$/.test(version||''))throw new MetaPublishError('การเชื่อมต่อเพจยังไม่ครบ');
 if(typeof caption!=='string'||!caption.trim()||!Array.isArray(imageUrls)||imageUrls.length<1||imageUrls.length>10||imageUrls.some(u=>!u.startsWith('https://')))throw new MetaPublishError('ข้อมูลโพสต์ไม่ถูกต้อง');
 async function call(edge,fields,final=false){let response;try{response=await fetcher(`https://graph.facebook.com/${version}/${pageId}/${edge}`,{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(fields),signal:AbortSignal.timeout(30000)});}catch{throw new MetaPublishError(final?'ยังยืนยันผลการเผยแพร่ไม่ได้ โปรดตรวจเพจ Facebook ก่อนลองใหม่':'อัปโหลดรูปไป Facebook ไม่สำเร็จ',{uncertain:final});}let data;try{data=await response.json();}catch{throw new MetaPublishError('Facebook ตอบกลับไม่สมบูรณ์',{uncertain:final});}if(!response.ok||data.error)throw new MetaPublishError('Facebook ปฏิเสธคำขอ กรุณาตรวจสิทธิ์เพจและการเชื่อมต่อ',{code:Number(data.error?.code)||null,uncertain:final&&response.status>=500});if(!data.id)throw new MetaPublishError('Facebook ไม่ส่งหมายเลขรายการกลับมา',{uncertain:final});return data.id;}
 const photos=[];for(const url of imageUrls)photos.push(await call('photos',{url,published:'false'}));
 const id=await call('feed',{message:caption,attached_media:JSON.stringify(photos.map(media_fbid=>({media_fbid})))},true);
 return {platformPostId:id,publishedAt:new Date().toISOString()};
}
