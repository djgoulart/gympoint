import Sequelize, { Model } from 'sequelize';

import Plan from './Plan';

class Enrollment extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.NUMBER,
        deleted_at: Sequelize.DATE,
      },
      { sequelize }
    );

    this.addHook('beforeSave', async enrollment => {
      const { duration, price: planPrice } = await Plan.findByPk(
        enrollment.plan_id
      );
      enrollment.price = planPrice * duration;
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    this.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
  }
}

export default Enrollment;
