const http = require('http');

function test(url, method, body) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8080,
            path: url,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('Checking error messages...\n');

    // Register a user first
    await test('/api/auth/register', 'POST', {
        username: 'debuguser',
        email: 'debug@test.com',
        password: 'pass123'
    });

    // Test 1: Duplicate username
    let r = await test('/api/auth/register', 'POST', {
        username: 'debuguser',
        email: 'different@test.com',
        password: 'pass123'
    });
    console.log('1. Duplicate username error:');
    console.log(`   Status: ${r.status}`);
    console.log(`   Message: "${r.body}"\n`);

    // Test 2: Duplicate email
    r = await test('/api/auth/register', 'POST', {
        username: 'different',
        email: 'debug@test.com',
        password: 'pass123'
    });
    console.log('2. Duplicate email error:');
    console.log(`   Status: ${r.status}`);
    console.log(`   Message: "${r.body}"\n`);

    // Test 3: Invalid login
    r = await test('/api/auth/login', 'POST', {
        email: 'nonexistent@test.com',
        password: 'anypass'
    });
    console.log('3. Invalid login error:');
    console.log(`   Status: ${r.status}`);
    console.log(`   Message: "${r.body}"\n`);
})();