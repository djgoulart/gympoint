import * as Yup from 'yup';
import { subDays } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const studentExists = await Student.findByPk(req.params.student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: req.params.student_id,
      },
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const studentExists = await Student.findByPk(req.params.student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not found' });
    }

    // Todo: O usuário só pode fazer 5 checkins dentro de um período de
    // 7 dias corridos.

    const checkinsNumber = await Checkin.findAndCountAll({
      where: {
        student_id: req.params.student_id,
        created_at: {
          [Op.lt]: new Date(),
          [Op.gt]: subDays(new Date(), 7),
        },
      },
    });

    if (checkinsNumber.count >= 5) {
      return res.status(401).json({ error: 'Checkins exceeded' });
    }

    const checkin = await Checkin.create({
      student_id: req.params.student_id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
