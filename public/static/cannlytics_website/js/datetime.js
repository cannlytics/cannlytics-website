// Date Time JavaScript

const monthNames = ['January', 'February', 'March', 'April',
'May', 'June', 'July', 'August', 'September', 'October',
'November', 'December'];

function getSuffix(int) {
  return ['', 'st', 'nd', 'rd'][int % 100 >> 3 ^ 1 && int % 10 ]||'th';
}

function formatFormalDate(value) {
  try {
    const dates = value.split('T')[0].split('-');
    const year = dates[0];
    const day = parseInt(dates[2]);
    const suffix = getSuffix(day);
    const month = monthNames[dates[1] - 1];
    return `${month} ${day}<sup>${suffix}</sup>, ${year}`;
  } catch (error) {
    return '';
  }
}

export default {
  getSuffix,
  formatFormalDate,
};
