// Shared profiles are authoritative on the server, never pending local uploads.
// Old local profiles without permission metadata remain eligible for migration.
export function pendingProfiles(saved, pending, cloud) {
  return saved.filter(p=>p.canEdit!==false &&
    !cloud.some(c=>c.id===p.id && c.canEdit===false) &&
    (pending.includes(p.id)||!cloud.some(c=>c.id===p.id)));
}
