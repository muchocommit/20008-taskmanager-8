import moment from 'moment';

export const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
};

export const toJSON = (response) => {
  return response.json();
};

export const getRandomIntInclusive = (min, max) => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);

  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
};

export const updateDueDate = ({currentTimestamp, newDate, newTime}) => {

  if (newTime && !newDate) {
    const currentDayStart = moment(`${currentTimestamp}`, `x`).startOf(`day`);
    const hours = +newTime.slice(0, newTime.indexOf(`:`));
    const minutes = +newTime.slice(newTime.indexOf(`:`) + 1, newTime.length);

    return currentDayStart
      .add(hours, `hours`).add(minutes, `minutes`).valueOf();
  }

  if (newDate && !newTime) {
    const currentDay = moment(`${currentTimestamp}`, `x`);
    const currentTime = currentDay.format(`HH:mm`);
    const hours = +currentTime.slice(0, currentTime.indexOf(`:`));
    const minutes = +currentTime.slice(currentTime.indexOf(`:`) + 1, currentTime.length);

    return moment(`${newDate}`, `YYYY-MM-DD`)
      .startOf(`day`).add(hours, `hours`)
      .add(minutes, `minutes`).valueOf();
  }

  if (newDate && newTime) {
    return moment(`${newDate} ${newTime}`, `YYYY-MM-DD HH:mm`).valueOf();
  }

  return moment(`${currentTimestamp}`, `x`).valueOf();
};

export const getCurrentWeekDays = () => {
  const weekStart = moment().startOf(`week`);
  const weekEnd = moment().endOf(`week`).add(1, `millisecond`);

  const days = weekEnd.diff(weekStart, `days`);
  const array = [];

  for (let i = 1; i <= days; i++) {
    array.push(weekStart.day(i).format(`YYYY-MM-DD`));
  }
  return array;
};

export const getDays = (dateStart, dateEnd) => {
  const dateStartDay = moment(dateStart).startOf(`day`);
  const dateEndDay = moment(dateEnd).endOf(`day`).add(1, `millisecond`);
  const days = dateEndDay.diff(dateStartDay, `days`);

  const array = [];

  for (let i = 1; i <= days; i++) {
    array.push(dateStartDay.day(i).format(`YYYY-MM-DD`));
  }

  return array;
};

export const getDailyTasks = (days, tasks) => {
  const array = [];
  days.map((day) => {

    tasks.map((task) => {
      const startOfDay = moment(day).startOf(`day`).format(`x`);
      const endOfDay = moment(day).endOf(`day`).format(`x`);

      if (task.dueDate >= startOfDay && task.dueDate <= endOfDay) {
        array.push(moment(task.dueDate).format(`MMM-D`));
      }
    });
  });
  return array;
};

export const getDailyTasksCounted = (dailyTasks) => {
  return dailyTasks.reduce((accumulator, currentValue) => {

    if (currentValue in accumulator) {
      accumulator[currentValue]++;

    } else {
      accumulator[currentValue] = 1;
    }

    return accumulator;
  }, {});
};

export const getRandomArrayElement = (array) => {
  return array[getRandomIntInclusive(0, array.length - 1)];
};

export const getRandomSlicedArray = (tags) => {
  return tags.slice(0, getRandomIntInclusive(1, tags.length));
};

const getOverdueTasks = (tasks) => {
  return tasks.filter((it) => it.dueDate < Date.now());
};

const getTodayTasks = (tasks) => {
  return tasks.filter((it) => {
    const startOfDay = moment().startOf(`day`).format(`x`);
    const endOfDay = moment().endOf(`day`).format(`x`);

    return it.dueDate >= startOfDay && it.dueDate <= endOfDay;
  });
};


const getRepeatingTasks = (tasks) => {
  return tasks.filter((it) => {
    return [...Object.entries(it.repeatingDays)].some((rec) => rec[1]);
  });
};

export const getFilteredTasks = (tasks, filterName) => {
  const filterNameToLowerCase = filterName.toLowerCase();

  switch (filterNameToLowerCase) {
    case `overdue`:
      return getOverdueTasks(tasks);

    case `today`:
      return getTodayTasks(tasks);

    case `repeating`:
      return getRepeatingTasks(tasks);

    default:
      return tasks;
  }
};

export const clearFilterInput = (filters) => {
  for (const filter of filters) {
    if (filter.hasAttribute(`checked`)) {
      filter.removeAttribute(`checked`);
    }
  }
};

const getFilterState = (name, count, target) => {
  if (count > 0) {
    if (target) {
      return name === target ? `checked` : ``;
    } else {
      return ``;
    }
  }
  return false;
};

export const getFiltersState = (tasks, filters, target = null) => {
  return filters.map((it) => {
    const filterNameToLowerCase = it.name.toLowerCase();

    switch (filterNameToLowerCase) {
      case `overdue`:
        it.count = getOverdueTasks(tasks).length;
        it.state = getFilterState(filterNameToLowerCase, it.count, target);
        return it;

      case `today`:
        it.count = getTodayTasks(tasks).length;
        it.state = getFilterState(filterNameToLowerCase, it.count, target);
        return it;

      case `repeating`:
        it.count = getRepeatingTasks(tasks).length;
        it.state = getFilterState(filterNameToLowerCase, it.count, target);
        return it;

      default:
        it.count = tasks.length;
        it.state = getFilterState(filterNameToLowerCase, it.count, target);
        return it;
    }
  });
};
