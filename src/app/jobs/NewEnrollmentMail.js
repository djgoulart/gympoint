import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class NewEnrollmentMail {
  get key() {
    return 'NewEnrollmentMail';
  }

  async handle({ data }) {
    const { student, plan, start_date, endDate, price } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Novo Plano Contratado',
      template: 'enrollment',
      context: {
        plan,
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price / 100),
        student,
        endDate: format(parseISO(endDate), "dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
        startDate: format(parseISO(start_date), "dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
      },
    });
  }
}

export default new NewEnrollmentMail();
