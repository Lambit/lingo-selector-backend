const app = require('./src/app');
const sequelize = require('./src/config/database');

//Sync new database created.
sequelize.sync({ force: true });

app.listen(3000, () => console.log('app is running on PORT: 3000'));
