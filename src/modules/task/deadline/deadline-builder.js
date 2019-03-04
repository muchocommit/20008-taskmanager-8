import concreteDeadline from './deadline-concreter';

import {getDayAndMonth} from '../../../assets/handler';
import {getTime} from '../../../assets/handler';

export default (dueDate, container) => {
  const deadLineContainer = container.querySelector(
    `.card__date-deadline`)
  const dayAndMonth = getDayAndMonth(dueDate);
  const time = getTime(dueDate);

  deadLineContainer.insertAdjacentHTML(
      `beforeend`, concreteDeadline(dayAndMonth, time));
};