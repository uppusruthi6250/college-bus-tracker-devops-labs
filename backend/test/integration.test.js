
const assert = require('node:assert/strict');
const { spawn, execFileSync } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');

const backendDirectory = path.resolve(__dirname, '..');
const { io } = require('socket.io-client');

let databaseDirectory;
let databasePath;
let server;
let port;
let baseUrl;
let testEnvironment;
let serverError = '';
let socket;

async function findFreePort() {
    const listener = net.createServer();
    listener.listen(0, '127.0.0.1');
    await once(listener, 'listening');
    const freePort = listener.address().port;
    await new Promise((resolve, reject) => {
        listener.close(error => error ? reject(error) : resolve());
    });
    return freePort;
}

function runDatabaseScript(scriptName) {
    execFileSync(
        process.execPath,
        [path.join(backendDirectory, 'scripts', scriptName)],
        { cwd: backendDirectory, env: testEnvironment, stdio: 'ignore' }
    );
}

async function startServer() {
    server = spawn(process.execPath, ['server.js'], {
        cwd: backendDirectory,
        env: testEnvironment,
        stdio: ['ignore', 'ignore', 'pipe']
    });

    serverError = '';
    server.stderr.setEncoding('utf8');
    server.stderr.on('data', chunk => {
        serverError += chunk;
    });

    const deadline = Date.now() + 15000;

    while (Date.now() < deadline) {
        if (server.exitCode !== null) {
            throw new Error(`Backend exited before becoming healthy: ${serverError}`);
        }

        try {
            const response = await fetch(`${baseUrl}/api/health`);

            if (response.ok) {
                return;
            }
        } catch {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    throw new Error(`Backend did not become healthy: ${serverError}`);
}

async function stopServer() {
    if (!server || server.exitCode !== null) {
        return;
    }

    const exited = once(server, 'exit');
    server.kill();
    await exited;
}

async function api(pathname, token, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${pathname}`, {
        ...options,
        headers,
        body: options.body === undefined
            ? undefined
            : JSON.stringify(options.body)
    });

    return {
        response,
        body: await response.json()
    };
}

function waitForSocketEvent(eventName, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new Error(`Timed out waiting for ${eventName}`)),
            timeoutMs
        );

        timer.unref();

        socket.once(eventName, data => {
            clearTimeout(timer);
            resolve(data);
        });

        socket.once('connect_error', error => {
            clearTimeout(timer);
            reject(error);
        });

        socket.once('auth-error', error => {
            clearTimeout(timer);
            reject(new Error(error.message));
        });
    });
}

before(async () => {
    databaseDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), 'college-bus-tracker-test-')
    );

    databasePath = path.join(databaseDirectory, 'bus_tracker.db');
    port = await findFreePort();
    baseUrl = `http://127.0.0.1:${port}`;

    testEnvironment = {
        ...process.env,
        DB_PATH: databasePath,
        JWT_SECRET: 'isolated-integration-test-secret',
        NODE_ENV: 'test',
        PORT: String(port)
    };

    runDatabaseScript('initDatabase.js');
    runDatabaseScript('seedData.js');

    await startServer();
});

after(async () => {
    if (socket) {
        socket.disconnect();
    }

    await stopServer();

    if (databaseDirectory) {
        fs.rmSync(databaseDirectory, {
            recursive: true,
            force: true
        });
    }
});

test('registration, authentication, admin bus assignment, and live tracking use SQLite', async () => {

    const health = await api('/api/health');

    assert.equal(health.response.status, 200);
    assert.equal(health.body.success, true);

    const adminLogin = await api('/api/auth/login', null, {
        method: 'POST',
        body: {
            username: 'admin',
            password: 'password123'
        }
    });

    assert.equal(adminLogin.response.status, 200);

    const adminToken = adminLogin.body.data.token;

    const protectedWithoutToken = await api('/api/admin/buses');

    assert.equal(protectedWithoutToken.response.status, 401);

    const driverRegistration = await api('/api/auth/register', null, {
        method: 'POST',
        body: {
            username: `integration-driver-${Date.now()}`,
            password: 'test-password-123',
            role: 'driver',
            full_name: 'Integration Driver',
            email: 'integration-driver@example.test'
        }
    });

    assert.equal(driverRegistration.response.status, 200);

    const driverToken = driverRegistration.body.data.token;
    const driverId = driverRegistration.body.data.user.id;

    const studentRegistration = await api('/api/auth/register', null, {
        method: 'POST',
        body: {
            username: `integration-student-${Date.now()}`,
            password: 'test-password-123',
            role: 'student',
            full_name: 'Integration Student',
            email: 'integration-student@example.test'
        }
    });

    assert.equal(studentRegistration.response.status, 200);

    const studentToken = studentRegistration.body.data.token;

    const forbidden = await api('/api/admin/buses', studentToken);

    assert.equal(forbidden.response.status, 403);

    const routes = await api('/api/admin/routes', adminToken);
    const route = routes.body.data.find(item => item.id === '22K');

    assert.ok(route, 'expected existing seeded route to be stored in SQLite');

    const createdBus = await api('/api/admin/buses', adminToken, {
        method: 'POST',
        body: {
            busNumber: `TEST-${Date.now()}`,
            routeId: route.id,
            driverId
        }
    });

    assert.equal(createdBus.response.status, 201);

    const busId = createdBus.body.data.id;

    const updatedBus = await api(`/api/admin/buses/${busId}`, adminToken, {
        method: 'PUT',
        body: {
            busNumber: createdBus.body.data.busNumber,
            routeId: route.id,
            driverId
        }
    });

    assert.equal(updatedBus.response.status, 200);

    const busList = await api('/api/admin/buses', adminToken);

    const assignedBus = busList.body.data.find(
        bus => bus.id === busId
    );

    assert.equal(assignedBus.driver_id, driverId);

    const stops = await api(
        `/api/admin/routes/${route.id}/stops`,
        adminToken
    );

    assert.ok(stops.body.data.length > 0);

    const selectedStop = stops.body.data[0];

    const stopSelection = await api('/api/student/select-stop', studentToken, {
        method: 'POST',
        body: {
            stopId: selectedStop.id
        }
    });

    assert.equal(stopSelection.response.status, 200);

    const trip = await api('/api/driver/trip/start', driverToken, {
        method: 'POST',
        body: {}
    });

    assert.equal(trip.response.status, 200);

    const activeBusUpdate = await api(
        `/api/admin/buses/${busId}`,
        adminToken,
        {
            method: 'PUT',
            body: {
                busNumber: createdBus.body.data.busNumber,
                routeId: route.id,
                driverId
            }
        }
    );

    assert.equal(activeBusUpdate.response.status, 409);

    socket = io(baseUrl, {
        transports: ['websocket'],
        reconnection: false
    });

    const authenticated = waitForSocketEvent('authenticated');

    socket.once('connect', () => {
        socket.emit('authenticate', {
            token: driverToken
        });
    });

    await authenticated;

    const locationReceived = waitForSocketEvent('receive-location');

    socket.emit('send-location', {
        latitude: selectedStop.latitude,
        longitude: selectedStop.longitude,
        speed: 10
    });

    const location = await locationReceived;

    assert.equal(location.busId, busId);
    assert.equal(location.latitude, selectedStop.latitude);

    const studentLocation = await api(
        '/api/student/bus-location',
        studentToken
    );

    assert.equal(studentLocation.response.status, 200);
    assert.equal(studentLocation.body.data.busActive, true);

    assert.equal(
        studentLocation.body.data.location.latitude,
        selectedStop.latitude
    );

    const duplicateDriver = await api('/api/admin/buses', adminToken, {
        method: 'POST',
        body: {
            busNumber: `TEST-DUP-${Date.now()}`,
            routeId: route.id,
            driverId
        }
    });

    assert.equal(duplicateDriver.response.status, 409);

    const backupPath = path.join(
        databaseDirectory,
        'bus_tracker.backup.db'
    );

    execFileSync(
        process.execPath,
        [
            path.join(backendDirectory, 'scripts', 'backupDatabase.js'),
            backupPath
        ],
        {
            cwd: backendDirectory,
            env: testEnvironment,
            stdio: 'ignore'
        }
    );

    const Database = require('better-sqlite3');

    const backup = new Database(backupPath, {
        readonly: true,
        fileMustExist: true
    });

    try {
        assert.ok(
            backup.prepare('SELECT id FROM buses WHERE id = ?').get(busId)
        );

        assert.ok(
            backup.prepare(
                'SELECT id FROM trip_history WHERE trip_id = ?'
            ).get(trip.body.data.tripId)
        );
    } finally {
        backup.close();
    }

    socket.disconnect();
    socket = null;

    await stopServer();
    await startServer();

    const afterRestart = await api('/api/admin/buses', adminToken);

    assert.equal(afterRestart.response.status, 200);

    assert.ok(
        afterRestart.body.data.some(bus => bus.id === busId)
    );
});
