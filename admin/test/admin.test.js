const request = require('supertest');
const app = require('../src/index');
let server;
let port;

beforeAll((done) => {
  server = app.listen(() => {
    port = server.address().port; // dynamically assigned port
    console.log(`Test server running on port ${port}`);
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe('Simple Test', () => {
  it('should return 200 OK for /investments/generate-csv', async () => {
    const res = await request(app).post('/investments/generate-csv');
    expect(res.statusCode).toEqual(200);
  });
});
