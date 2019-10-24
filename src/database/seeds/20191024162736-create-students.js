const chance = require('chance').Chance();

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'students',
      [
        {
          name: chance.name(),
          email: chance.email(),
          age: chance.age(),
          weight: chance.integer({ min: 40, max: 120 }),
          stature: chance.integer({ min: 120, max: 240 }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: chance.name(),
          email: chance.email(),
          age: chance.age(),
          weight: chance.integer({ min: 40, max: 120 }),
          stature: chance.integer({ min: 120, max: 240 }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: chance.name(),
          email: chance.email(),
          age: chance.age(),
          weight: chance.integer({ min: 40, max: 120 }),
          stature: chance.integer({ min: 120, max: 240 }),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: {},
};
