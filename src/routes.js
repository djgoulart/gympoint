import { Router } from 'express';

import User from './app/models/User';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ ok: true });
});

routes.post('/users', async (req, res) => {
  const user = await User.create({
    name: 'Diego',
    email: 'diegogoulart.aws@gmail.com',
    password: '123123',
  });

  return res.json(user);
});

export default routes;
