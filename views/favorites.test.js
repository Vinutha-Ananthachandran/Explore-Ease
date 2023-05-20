const ejs = require("ejs");
const fs = require("fs");

//negative case
describe('No favorites to show scenario test', () => {
  it('renders correctly', () => {
    const templateContent = fs.readFileSync('./views/favorites.ejs', 'utf-8');
    const data = {
      title: "Explore Ease | My Favorites",
      name: "Explore Ease",
      favorites: []
    };
    const renderedTemplate1 = ejs.render(templateContent, data);
    expect(renderedTemplate1).toMatchSnapshot();
  });
});

//positive case
describe('When events are favorited', () => {
  it('renders correctly', () => {
    const templateContent = fs.readFileSync('./views/favorites.ejs', 'utf-8');
    const data = {
      title: "Explore Ease | My Favorites",
      name: "Explore Ease",
      favorites: [
      {
        image_url: 'https://seatgeek.com/images/performers-landscape/cruel-world-fest-1d31e3/787780/huge.jpg',
        title: 'Cruel World Fest with Siouxsie  Iggy Pop  Billy Idol and more',
        venue: 'Brookside at the Rose Bowl',
        date: '2023-05-20T19:00:00',
        url: 'https://seatgeek.com/cruel-world-fest-with-siouxsie-iggy-pop-billy-idol-and-more-tickets/pasadena-california-brookside-at-the-rose-bowl-2023-05-20-12-pm/music-festival/5922582'
      },
      {
        image_url: 'https://seatgeek.com/images/performers-landscape/santa-anita-horse-racing-4d639a/374935/huge.jpg',
        title: 'Live Racing at Santa Anita Park',
        venue: 'Santa Anita Park',
        date: '2023-05-20T19:00:00',
        url: 'https://seatgeek.com/live-racing-at-santa-anita-park-tickets/horse-racing/2023-05-20-12-pm/5921020'
      },
      {
        image_url: 'https://seatgeek.com/images/performers-landscape/loyola-marymount-lions-baseball-f5c80e/101714/huge.jpg',
        title: 'Pacific Tigers at Loyola Marymount Lions Baseball',
        venue: 'Page Baseball Stadium',
        date: '2023-05-20T20:00:00',
        url: 'https://seatgeek.com/pacific-tigers-at-loyola-marymount-lions-baseball-tickets/ncaa-baseball/2023-05-20-1-pm/5969002'
      },
      {
        image_url: 'https://seatgeek.com/images/performers-landscape/the-texas-taco-tequila-music-festival-151b1a/709954/huge.jpg',
        title: 'The Texas Taco Tequila & Music Festival (Saturday Pass)',
        venue: 'Central Park - Santa Clarita',
        date: '2023-05-20T20:00:00',
        url: 'https://seatgeek.com/the-texas-taco-tequila-and-music-festival-saturday-pass-tickets/santa-clarita-california-central-park-santa-clarita-1-2023-05-20-1-pm/music-festival/6032194'
      }
    ]
  };
    const renderedTemplate2 = ejs.render(templateContent, data);
    expect(renderedTemplate2).toMatchSnapshot();
  });
});
