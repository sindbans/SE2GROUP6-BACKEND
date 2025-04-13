const app = require('./app');

const seatRoutes = require('./routes/seatRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // ✅ add this

app.use('/api/seats', seatRoutes);
app.use('/api/payment', paymentRoutes); // ✅ register it here

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
