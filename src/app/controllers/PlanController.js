import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      where: { deleted_at: null },
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async show(req, res) {
    const { id } = req.params;

    const plan = await Plan.findOne({
      where: { id, deleted_at: null },
      attributes: ['id', 'title', 'duration', 'price'],
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    return res.json(plan);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { title, duration, price } = req.body;

    const plan = await Plan.create({ title, duration, price });

    return res.json({
      id: plan.id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
      deleted_at: Yup.date(),
    });

    const plan = await Plan.findOne({
      where: { id, deleted_at: null },
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    await plan.update(req.body);

    return res.json(plan);
  }

  async delete(req, res) {
    const { id } = req.params;

    const plan = await Plan.findOne({
      where: { id, deleted_at: null },
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    await plan.update({ deleted_at: new Date() });

    return res.json();
  }
}

export default new PlanController();
