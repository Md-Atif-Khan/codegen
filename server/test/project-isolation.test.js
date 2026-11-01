// Regression test: projects must be scoped to the logged-in user.
// Run with:  npm test   (requires a reachable MongoDB; defaults to mongodb://127.0.0.1:27017/codegen-test)
//
// Boots the real Express app in a child process against a throwaway database,
// signs up two users, creates a project for each, and asserts that neither
// user can list, read, update or delete the other's project.

import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5611;
const BASE = `http://127.0.0.1:${PORT}/api`;
const MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/codegen-test';

const startServer = () =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT, MONGODB_URI, JWT_SECRET: 'test-secret', CLIENT_URL: 'http://localhost', API_KEY: 'x' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    const onData = (d) => {
      out += d;
      if (out.includes(`Server running on port ${PORT}`)) resolve(child);
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => reject(new Error(`server exited early (${code}):\n${out}`)));
    setTimeout(() => reject(new Error(`server did not start:\n${out}`)), 10000);
  });

// Minimal client that remembers the auth cookie per user.
const makeClient = () => {
  let cookie = '';
  return async (method, url, body) => {
    const res = await fetch(BASE + url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data };
  };
};

const signupAndLogin = async (client, username) => {
  const password = 'Passw0rd!';
  const s = await client('POST', '/auth/signup', { username, password });
  assert.equal(s.status, 201, `signup ${username}: ${JSON.stringify(s.data)}`);
  const l = await client('POST', '/auth/login', { username, password });
  assert.equal(l.status, 200, `login ${username}: ${JSON.stringify(l.data)}`);
};

const run = async () => {
  await mongoose.connect(MONGODB_URI);
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();

  const server = await startServer();
  try {
    const alice = makeClient();
    const bob = makeClient();
    const stamp = Date.now();
    await signupAndLogin(alice, `alice_${stamp}`);
    await signupAndLogin(bob, `bob_${stamp}`);

    const a = await alice('POST', '/projects', { name: 'alice-project', description: 'a', language: 'cpp' });
    const b = await bob('POST', '/projects', { name: 'bob-project', description: 'b', language: 'cpp' });
    assert.equal(a.status, 201);
    assert.equal(b.status, 201);

    // 1. Listing is scoped to the caller.
    const aliceList = await alice('GET', '/projects');
    assert.equal(aliceList.status, 200);
    assert.deepEqual(aliceList.data.map((p) => p.name), ['alice-project'], 'alice sees only her own project');

    const bobList = await bob('GET', '/projects');
    assert.deepEqual(bobList.data.map((p) => p.name), ['bob-project'], 'bob sees only his own project');

    // 2. Reading someone else's project by id is a 404.
    const peek = await alice('GET', `/projects/${b.data._id}`);
    assert.equal(peek.status, 404, 'alice cannot read bob\'s project');

    // 3. Updating someone else's project is a 404 and leaves it untouched.
    const tamper = await alice('PUT', `/projects/${b.data._id}`, { name: 'hacked' });
    assert.equal(tamper.status, 404, 'alice cannot update bob\'s project');
    const bobAfter = await bob('GET', `/projects/${b.data._id}`);
    assert.equal(bobAfter.data.name, 'bob-project', 'bob\'s project name unchanged');

    // 4. Deleting someone else's project is a 404 and it still exists.
    const del = await alice('DELETE', `/projects/${b.data._id}`);
    assert.equal(del.status, 404, 'alice cannot delete bob\'s project');
    const bobStill = await bob('GET', `/projects/${b.data._id}`);
    assert.equal(bobStill.status, 200, 'bob\'s project still exists');

    // 5. Owner can still do everything.
    const own = await bob('PUT', `/projects/${b.data._id}`, { name: 'bob-renamed' });
    assert.equal(own.status, 200);
    assert.equal(own.data.name, 'bob-renamed');
    const ownDel = await bob('DELETE', `/projects/${b.data._id}`);
    assert.equal(ownDel.status, 204);

    // 6. Weak password returns a 400, not a crash.
    const weak = await makeClient()('POST', '/auth/signup', { username: `weak_${stamp}`, password: 'short' });
    assert.equal(weak.status, 400, `weak password: ${JSON.stringify(weak.data)}`);

    console.log('PASS: project isolation');
  } finally {
    server.kill();
  }
};

run().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
