import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .positive()
        .required(),
      weight: Yup.number()
        .integer()
        .positive()
        .required(),
      stature: Yup.number()
        .integer()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const { id, name, email, age, weight, stature } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      stature,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number()
        .integer()
        .positive(),
      weight: Yup.number()
        .integer()
        .positive(),
      stature: Yup.number()
        .integer()
        .positive(),
    });

    const { id } = req.params;
    const { email } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    if (email && email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });

      if (studentExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const { name, age, weight, stature } = await student.update(req.body);

    return res.json({
      id,
      name,
      email: student.email,
      age,
      weight,
      stature,
    });
  }
}

export default new StudentController();
