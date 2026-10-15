export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export function actionError(error: string): ActionResult {
  return { ok: false, error };
}

export function actionSuccess(message?: string): ActionResult {
  return message ? { ok: true, message } : { ok: true };
}
