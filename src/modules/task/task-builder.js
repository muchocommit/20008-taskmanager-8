import API from '../../api'
import flatpickr from 'flatpickr';
import {daysChart, tagsChart, colorChart} from '../../assets/chart';
import {filters} from '../../data';
import {
  getCurrentWeekDays,
  getDailyTasks,
  getFilteredTasks,
  getFiltersState,
  getDailyTasksCounted,
  getDays,
  clearFilterInput} from '../../assets/handler';

import buildFilterContainer from '../filter/container/container-builder';
import bridgeTask from './task-bridge';

const main = document.querySelector(`.main`);

const searchContainer = main.querySelector(
    `.main__search`);
const controls = main.querySelector(
    `.control__btn-wrap`);
const statistic = main.querySelector(
    `.statistic`);

const daysCtx = statistic.querySelector(`.statistic__days`);
const tagsCtx = statistic.querySelector(`.statistic__tags`);
const colorsCtx = statistic.querySelector(`.statistic__colors`);

const dateInput = statistic.querySelector(`.statistic__period-input`);
const board = document.querySelector(`.board`);

const AUTHORIZATION = `Basic dXNlckBwYXNzd29yZAosdf1=ad}`;
const END_POINT = `https://es8-demo-srv.appspot.com/task-manager`;

const Api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});

export default () => {
  Api.getTasks()
    .then((loadedTasks) => {

      const weeklyTasks = getDailyTasksCounted(
        getDailyTasks(getCurrentWeekDays(), loadedTasks));

      const daysInWeek = Object.keys(weeklyTasks);
      const daysInWeekCount = Object.values(weeklyTasks);

      const firstDayInWeek = daysInWeek[0];
      const lastDayInWeek = daysInWeek[daysInWeek.length - 1];

      daysChart(daysCtx, daysInWeek, daysInWeekCount);
      tagsChart(tagsCtx);
      colorChart(colorsCtx);

      flatpickr(`.statistic__period-input`, {
        altInput: true, altFormat: `j F`, dateFormat: `Y-m-d`, mode: `range` });

      const dateInputPlaceholder = statistic.querySelector(
        `.statistic__period-input.form-control`);

      dateInputPlaceholder.placeholder = `${firstDayInWeek} – ${lastDayInWeek}`;

      dateInput.addEventListener(`change`, (e) => {
        e.stopPropagation();
        const {target} = e;

        if (target.value.length > 10) {
          const dateStart = target.value.substring(0, 10);
          const dateEnd = target.value.substring(14, 24);

          const dailyTasks = getDailyTasksCounted(
            getDailyTasks(getDays(dateStart, dateEnd), loadedTasks));

          const daysInDate = Object.keys(dailyTasks);
          const daysInDateCount = Object.values(dailyTasks);

          daysChart(daysCtx, daysInDate, daysInDateCount);
        }
      });

      controls.addEventListener(`click`, (e) => {
        const {target} = e;

        if (target.tagName.toUpperCase() === `LABEL`) {
          const controlValue = target.attributes[`for`].nodeValue;
          if (controlValue === `control__statistic`) {

            statistic.classList.remove(`visually-hidden`);
            board.classList.add(`visually-hidden`);
          } else if (!statistic.classList.contains(`visually-hidden`)) {

            statistic.classList.add(`visually-hidden`);
          }
        }
      });

      const filterContainer = buildFilterContainer(searchContainer,
        getFiltersState(loadedTasks, filters));

      filterContainer.onFilter = (target) => {

        if (board.classList.contains(`visually-hidden`)) {
          board.classList.remove(`visually-hidden`);
        }

        if (!statistic.classList.contains(`visually-hidden`)) {
          statistic.classList.add(`visually-hidden`);
        }

        Api.getTasks()
          .then((updatedTasks) => {
            const filterInputs = [...main.querySelectorAll(`input[name='filter']`)];
            const currentFilterInput = main.querySelector(`#filter__${target}`);
            clearFilterInput(filterInputs);


            filterContainer.update(getFiltersState(updatedTasks, filters, target));
            currentFilterInput.setAttribute(`checked`, `checked`);
            // Reset all checked filters
            // Add checked attribute for input
            bridgeTask(getFilteredTasks(updatedTasks, target), Api);
          });
      };
    });
};


