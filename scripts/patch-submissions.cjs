// Legacy compatibility patch. The current app/page.tsx already contains the submission UI changes,
// so this build-time patch must not fail the production build when its old string targets are absent.
// Keeping this file as a no-op also prevents a stale patch from overwriting newer submission state logic.
process.exit(0);
