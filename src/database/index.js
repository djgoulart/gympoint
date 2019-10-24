import Sequelize from 'sequelize';

import User from '../app/models/User';
import Student from '../app/models/Student';

import dbConfig from '../config/database';

const models = [User, Student];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
