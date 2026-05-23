export function isDummyDataEnabled() {
  return (process.env.DUMMY_DATA ?? "true").toLowerCase() === "true";
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

