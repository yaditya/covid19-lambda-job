const cheerio = require('cheerio');

const extractListingsFromHTML = (html) => {
  const $ = cheerio.load(html);
  const locationRows = $('.luna-table--responsiveList tbody tr');

  const locations = [];

  locationRows.each((i, el) => {
    const childEl = $(el).children('td');
    const centreName = $(childEl).eq(0).text().trim();
    const referralRequired = $(childEl).eq(1).text().trim();
    const phone = $(childEl).eq(2).text().trim();
    const state = $(childEl).eq(3).text().trim();
    const address = $(childEl).eq(4).text().trim();
    const openingHours = $(childEl).eq(5).text().trim();

    locations.push({
      centreName,
      referralRequired,
      phone,
      state,
      address,
      openingHours,
    });
  });
  return locations;
};

module.exports = {
  extractListingsFromHTML,
};
