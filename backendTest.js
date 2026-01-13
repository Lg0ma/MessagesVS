const http = require('http');

const BASE_URL = 'http://localhost:8080';

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test data - Use unique names each time to avoid conflicts
const timestamp = Date.now();
let testUser1 = {
    username: `testuser1_${timestamp}`,
    email: `testuser1_${timestamp}@example.com`,
    password: 'password123'
};

let testUser2 = {
    username: `testuser2_${timestamp}`,
    email: `testuser2_${timestamp}@example.com`,
    password: 'password456'
};

let authToken1 = null;
let authToken2 = null;

// HTTP request helper
function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data,
                    json: () => {
                        try {
                            return JSON.parse(data);
                        } catch (e) {
                            return null;
                        }
                    },
                    text: () => data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

// Test assertion helper
function assert(condition, testName) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`${colors.green}✓${colors.reset} ${testName}`);
    } else {
        failedTests++;
        console.log(`${colors.red}✗${colors.reset} ${testName}`);
    }
}

// Test suite runner
async function runTests() {
    console.log(`\n${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.cyan}   BACKEND API TEST SUITE${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}\n`);

    // ==========================================
    // AUTHENTICATION TESTS
    // ==========================================

    console.log(`${colors.yellow}Authentication Tests:${colors.reset}`);

    try {
        // Test 1: Register User 1
        let response = await makeRequest('POST', '/api/auth/register', testUser1);
        assert(response.status === 200, 'Should register new user');
        assert(response.text() === 'User Registered successfully', 'Should return success message');

        // Test 2: Reject duplicate username
        let duplicateUser = {
            username: testUser1.username,
            email: 'different@example.com',
            password: 'password789'
        };
        response = await makeRequest('POST', '/api/auth/register', duplicateUser);
        assert(response.status === 400, 'Should reject duplicate username');
        assert(response.text() === 'UserName Already Exists', 'Should return username exists error');

        // Test 3: Reject duplicate email
        duplicateUser = {
            username: 'differentuser',
            email: testUser1.email,
            password: 'password789'
        };
        response = await makeRequest('POST', '/api/auth/register', duplicateUser);
        assert(response.status === 400, 'Should reject duplicate email');
        assert(response.text() === 'Email Already Exists', 'Should return email exists error');

        // Test 4: Register User 2
        response = await makeRequest('POST', '/api/auth/register', testUser2);
        assert(response.status === 200, 'Should register second user');

        // Test 5: Login with valid credentials
        response = await makeRequest('POST', '/api/auth/login', {
            email: testUser1.email,
            password: testUser1.password
        });
        assert(response.status === 200, 'Should login with valid credentials');
        const loginData = response.json();
        assert(loginData !== null && loginData.token, 'Should return JWT token');
        assert(loginData.email === testUser1.email, 'Should return correct email');
        assert(loginData.username === testUser1.username, 'Should return correct username');
        authToken1 = loginData.token;

        // Test 6: Reject invalid email
        response = await makeRequest('POST', '/api/auth/login', {
            email: 'nonexistent@example.com',
            password: 'anypassword'
        });
        assert(response.status === 401, 'Should reject invalid email');
        assert(response.text() === 'Invalid email', 'Should return invalid email message');

        // Test 7: Reject invalid password
        response = await makeRequest('POST', '/api/auth/login', {
            email: testUser1.email,
            password: 'wrongpassword'
        });
        assert(response.status === 401, 'Should reject invalid password');
        assert(response.text() === 'Invalid email or password', 'Should return invalid password message');

        // Test 8: Login User 2
        response = await makeRequest('POST', '/api/auth/login', {
            email: testUser2.email,
            password: testUser2.password
        });
        assert(response.status === 200, 'Should login second user');
        authToken2 = response.json().token;

    } catch (error) {
        console.error(`${colors.red}Error in authentication tests:${colors.reset}`, error.message);
    }

    // ==========================================
    // PROTECTED ROUTE TESTS
    // ==========================================

    console.log(`\n${colors.yellow}Protected Route Tests:${colors.reset}`);

    try {
        // Test 9: Reject without token
        let response = await makeRequest('GET', '/api/auth/test-protected');
        assert(response.status === 403, 'Should reject request without token');

        // Test 10: Reject with invalid token
        response = await makeRequest('GET', '/api/auth/test-protected', null, {
            'Authorization': 'Bearer invalidtoken123'
        });
        assert(response.status === 403, 'Should reject invalid token');

        // Test 11: Allow with valid token
        response = await makeRequest('GET', '/api/auth/test-protected', null, {
            'Authorization': `Bearer ${authToken1}`
        });
        assert(response.status === 200, 'Should allow request with valid token');
        assert(response.text() === 'You are authenticated', 'Should return authenticated message');

        // Test 12: Allow second user with their token
        response = await makeRequest('GET', '/api/auth/test-protected', null, {
            'Authorization': `Bearer ${authToken2}`
        });
        assert(response.status === 200, 'Should allow second user with their token');

    } catch (error) {
        console.error(`${colors.red}Error in protected route tests:${colors.reset}`, error.message);
    }

    // ==========================================
    // JWT TOKEN TESTS
    // ==========================================

    console.log(`\n${colors.yellow}JWT Token Tests:${colors.reset}`);

    try {
        // Test 13: Token structure
        const payload = JSON.parse(
            Buffer.from(authToken1.split('.')[1], 'base64').toString()
        );
        assert(payload.sub === testUser1.email, 'Token should contain correct email');
        assert(payload.hasOwnProperty('iat'), 'Token should have issued-at timestamp');
        assert(payload.hasOwnProperty('exp'), 'Token should have expiration timestamp');

        // Test 14: Token expiration
        const expirationTime = payload.exp - payload.iat;
        const expectedExpiration = 24 * 60 * 60; // 24 hours
        assert(expirationTime === expectedExpiration, 'Token should expire in 24 hours');

        // Test 15: Malformed token rejection
        let response = await makeRequest('GET', '/api/auth/test-protected', null, {
            'Authorization': 'Bearer not.a.valid.token'
        });
        assert(response.status === 403, 'Should reject malformed token');

        // Test 16: Token without Bearer prefix
        response = await makeRequest('GET', '/api/auth/test-protected', null, {
            'Authorization': authToken1
        });
        assert(response.status === 403, 'Should reject token without Bearer prefix');

    } catch (error) {
        console.error(`${colors.red}Error in JWT token tests:${colors.reset}`, error.message);
    }

    // ==========================================
    // MULTIPLE USERS TEST
    // ==========================================

    console.log(`\n${colors.yellow}Multiple Users Tests:${colors.reset}`);

    try {
        // Test 17: Different tokens for different users
        assert(authToken1 !== authToken2, 'Different users should have different tokens');

        // Test 18: Both users can authenticate simultaneously
        const response1 = await makeRequest('GET', '/api/auth/test-protected', null, {
            'Authorization': `Bearer ${authToken1}`
        });
        const response2 = await makeRequest('GET', '/api/auth/test-protected', null, {
            'Authorization': `Bearer ${authToken2}`
        });
        assert(
            response1.status === 200 && response2.status === 200,
            'Multiple users can authenticate simultaneously'
        );

    } catch (error) {
        console.error(`${colors.red}Error in multiple users tests:${colors.reset}`, error.message);
    }

    // ==========================================
    // STATELESS TESTS
    // ==========================================

    console.log(`\n${colors.yellow}Stateless Authentication Tests:${colors.reset}`);

    try {
        // Test 19: Token reusability
        for (let i = 0; i < 3; i++) {
            const response = await makeRequest('GET', '/api/auth/test-protected', null, {
                'Authorization': `Bearer ${authToken1}`
            });
            assert(response.status === 200, `Token should work multiple times (attempt ${i + 1})`);
        }

    } catch (error) {
        console.error(`${colors.red}Error in stateless tests:${colors.reset}`, error.message);
    }

    // ==========================================
    // RESULTS SUMMARY
    // ==========================================

    console.log(`\n${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.cyan}   TEST RESULTS${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

    if (failedTests === 0) {
        console.log(`\n${colors.green}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}❌ SOME TESTS FAILED${colors.reset}\n`);
        process.exit(1);
    }
}

// Run the tests
console.log('Starting tests...');
console.log(`Testing against: ${BASE_URL}`);
console.log('Make sure your backend server is running!\n');

runTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});