const io = require('socket.io-client');
const assert = require('assert');

describe('Seat Booking', function() {
  it('should book a seat successfully', function(done) {
    const socket = io('http://localhost:3000');
    socket.emit('login', { username: 'testuser' }, (response) => {
      const token = response.token;
      socket.emit('bookSeat', { seatIndex: 0, token });
      socket.on('bookingSuccess', ({ seatIndex }) => {
        assert.strictEqual(seatIndex, 0);
        done();
      });
    });
  });

  it('should fail to book an already booked seat', function(done) {
    const socket = io('http://localhost:3000');
    socket.emit('login', { username: 'testuser2' }, (response) => {
      const token = response.token;
      socket.emit('bookSeat', { seatIndex: 0, token });
      socket.on('bookingFailed', () => {
        done();
      });
    });
  });
});