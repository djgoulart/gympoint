import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Student from '../models/Student';
import Plan from '../models/Plan';
import Enrollment from '../models/Enrollment';

import NewEnrollmentMail from '../jobs/NewEnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const enrolls = await Enrollment.findAll({
      where: { deleted_at: null },
      order: ['created_at'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'start_date',
        'end_date',
        'price',
        'plan_id',
        'student_id',
      ],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'stature'],
        },
      ],
    });

    return res.json(enrolls);
  }

  async show(req, res) {
    const enrollment = await Enrollment.findOne({
      where: { id: req.params.id },
      attributes: [
        'id',
        'start_date',
        'end_date',
        'price',
        'plan_id',
        'student_id',
      ],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'stature'],
        },
      ],
    });

    return res.json(enrollment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const parsedData = parseISO(start_date);

    const endDate = addMonths(parsedData, plan.duration);

    const { id, price } = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date: endDate,
    });

    Queue.add(NewEnrollmentMail.key, {
      student,
      plan,
      start_date,
      endDate,
      price,
    });

    /* NewEnrollmentMail.handle({
      data: { student, plan, start_date, endDate, price },
    }); */

    return res.json({ id, student_id, plan_id, price, start_date, endDate });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id,
        deleted_at: null,
      },
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'stature'],
        },
      ],
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    const { plan_id, start_date } = req.body;

    let plan;
    let endDate;

    // If plan changed.
    if (plan_id && plan_id !== enrollment.plan_id) {
      plan = await Plan.findOne({
        where: {
          id: plan_id,
          deleted_at: null,
        },
      });

      if (!plan) {
        return res.status(400).json({ error: 'Plan not found' });
      }
    }

    if (start_date && start_date !== enrollment.start_date) {
      const parsedData = parseISO(start_date);

      if (!plan) {
        endDate = addMonths(parsedData, enrollment.plan.duration);
      } else {
        endDate = addMonths(parsedData, plan.duration);
      }
    }

    await enrollment.update({
      end_date: endDate,
      ...req.body,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const { id } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    await enrollment.update({
      deleted_at: new Date(),
    });

    return res.json();
  }
}

export default new EnrollmentController();
