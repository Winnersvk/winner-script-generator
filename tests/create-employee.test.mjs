import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createEmployee} from '../lib/create-employee.mjs';
const valid={name:'พนักงาน',email:'STAFF@example.com',password:'Long-password-123'};
function req(body=valid,origin='https://mkt.example'){
 return new Request('https://mkt.example/api/admin/users',{method:'POST',headers:{origin},body:typeof body==='string'?body:JSON.stringify(body)});
}
function setup({user={id:'admin'},admin=true,roleError=null,result={data:{user:{id:'new-user',email:'staff@example.com'}}},fail=false}={}){
 const calls=[];
 return {calls,deps:{sameOrigin:r=>r.headers.get('origin')===new URL(r.url).origin,signedIn:async()=>({user,db:{rpc:async()=>({data:admin,error:roleError})}}),createAccount:async attrs=>{calls.push(attrs);if(fail)throw new Error('secret');return result;}}};
}
test('unauthenticated, non-admin, failed role lookup and foreign origins cannot create accounts',async()=>{
 for(const [options,origin,status] of [[{user:null},undefined,401],[{admin:false},undefined,403],[{roleError:{}},undefined,403],[{},'https://other.example',403]]){
  const {calls,deps}=setup(options);const r=await createEmployee(req(valid,origin),deps);
  assert.equal(r.status,status);assert.equal(calls.length,0);assert.equal(r.headers.get('cache-control'),'private, no-store');
 }
});
test('creates confirmed member account without accepting elevated permissions or exposing password',async()=>{
 const {calls,deps}=setup();const r=await createEmployee(req({...valid,role:'service_role',app_metadata:{admin:true},admin:true}),deps);
 assert.equal(r.status,201);assert.deepEqual(calls,[{email:'staff@example.com',password:valid.password,email_confirm:true,user_metadata:{full_name:valid.name}}]);
 assert.deepEqual(await r.json(),{user:{id:'new-user',email:'staff@example.com'}});
});
test('rejects invalid payloads before privileged calls',async()=>{
 for(const body of ['{','null','x'.repeat(4097),{...valid,name:' '},{...valid,email:'bad'},{...valid,password:'short'},{...valid,password:42},{...valid,name:'a'.repeat(101)}]){
  const {calls,deps}=setup();const r=await createEmployee(req(body),deps);
  assert.ok([400,413].includes(r.status));assert.equal(calls.length,0);
 }
});
test('duplicate and weak passwords have actionable errors without leaking provider details',async()=>{
 for(const [error,status] of [[{code:'email_exists'},409],[{code:'user_already_exists'},409],[{code:'weak_password'},400],[{status:429},429],[{message:'secret'},503]]){
  const {deps}=setup({result:{error}});const r=await createEmployee(req(),deps);assert.equal(r.status,status);assert.ok(!(await r.text()).includes('secret'));
 }
});
test('network or configuration failure is not retried and does not expose secrets',async()=>{
 const {deps,calls}=setup({fail:true});const r=await createEmployee(req(),deps);assert.equal(r.status,503);assert.equal(calls.length,1);assert.ok(!(await r.text()).includes('secret'));
});
