// Supabase Edge Function blueprint.
// Deploy server-side. Do NOT move X client secrets/service-role keys to app.js.
//
// POST body: { project_id: string }
// Auth: Supabase user JWT
//
// Algorithm:
// 1. Authenticate user.
// 2. Lock/validate the project is currently live.
// 3. Load required tasks.
// 4. Check task_verifications cache.
// 5. Call X API only for tasks with no valid cached result.
// 6. Upsert each result into task_verifications.
// 7. If all required tasks are verified, insert mission_submissions.
// 8. unique(project_id,user_id) prevents duplicate submissions.
//
// Pseudocode:
//
// const user = requireAuthenticatedUser(req);
// const project = await db.projects.get(projectId);
// if (!project || project.status !== "live" || new Date() >= project.ends_at) throw 400;
//
// const tasks = await db.tasks.required(projectId);
// for (const task of tasks) {
//   const cached = await db.verifications.get(projectId, task.id, user.id);
//   if (cached && isFresh(cached)) continue;
//
//   let result;
//   if (task.task_type === "x_follow") result = await verifyFollow(user, task.target_value);
//   if (task.task_type === "x_like") result = await verifyLike(user, task.target_value);
//   if (task.task_type === "x_repost") result = await verifyRepost(user, task.target_value);
//   // website/discord/custom use their own verification method.
//
//   await db.verifications.upsert({
//     project_id: projectId, task_id: task.id, user_id: user.id,
//     status: result ? "verified" : "failed", source: "x_api"
//   });
// }
//
// const ok = await db.verifications.allRequiredVerified(projectId, user.id);
// if (!ok) return json({eligible:false});
//
// await db.submissions.insert({project_id:projectId,user_id:user.id,status:"verified",verified_at:new Date()});
// return json({eligible:true});
//
// Add rate-limit/backoff handling around X requests.
// Keep cached verification TTL short enough for the task semantics.
