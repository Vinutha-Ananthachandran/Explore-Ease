const express = require("express");
const ejs = require("ejs");
const path = require("path");
const favicon = require("serve-favicon");
const expressLayouts = require("express-ejs-layouts");
const axios = require('axios');
const cors = require('cors');

const app = express();
let yres;
let sres;
let hres;
let fav_arr = [];
let attractions_arr = [];

//cross origin requests handling
app.use(cors({
  origin: '*'
}));

//setting EJS(embedded JS) as the view engine and loading the layouts
//to increase reusability of templates and partials
app.set('view engine','ejs');
app.use(expressLayouts);
app.set("layout","../views/layouts/layout.ejs");

//setting up the directories
app.use(express.static("public"));
app.use('/css',express.static(__dirname+'/public/css'));
app.use('/img',express.static(__dirname+'/public/img'));
app.use('/js',express.static(__dirname+'/public/js'));
app.use(express.static("node_modules/bootstrap/dist/css"));
app.use(express.static("node_modules/bootstrap/dist/js"));

//adding website icon/favicon
app.use(favicon(path.join("public","favicon.ico")));

//home page
app.get('/',(req,res)=>{
  const data = {
    title: 'Explore Ease',
    name: 'Explore Ease'
  };
  res.render('index',data);
});

//favorites page
app.get('/favorites',(req,res)=>{
  const data = {
    title: "Explore Ease | My Favorites",
    name: "Explore Ease",
    favorites: fav_arr,
  };
  res.render('favorites',data);
});

//building user favorites
app.get('/set_favorites/:x',(req,res)=>{
  fav_arr = [];
  if(req.params.x != 'null' && req.params.x != '' && req.params.x != undefined && req.params.x != '$'){
    let fav_inp = req.params.x.split("|");
    for(let i=0;i<fav_inp.length;i++){
      let data = fav_inp[i].split(",");
      let data_obj = {
          'image_url': data[0],
          'title': data[1],
          'venue': data[2],
          'date': data[4],
          'url': data[3]
        };
      fav_arr.push(data_obj);
    }
  }
  res.send("favorites set");
});

//results page
app.get('/results',(req,res)=>{
  let intval;
  if(sres != undefined){
    intval = Math.ceil(sres.length/4);
  }else{
    intval = 0;
  }
  const data = {
    title: 'Explore Ease | Results',
    name: "Explore Ease",
    header: "Top Results",
    yresult: yres,
    sgresult: sres,
    htresult: hres,
    interval: intval,
    attractions: attractions_arr,
  }
  res.render('results',data);
});

//client call to get seatgeek api data
app.get('/seatgeek/:x',(req,res)=>{
  let dates = req.params.x.split(',');
  callToSeatGeek(dates,res);
});

//server call to seatgeek api
function callToSeatGeek(dates,res){
  let url='https://api.seatgeek.com/2/events?datetime_utc.gte='+dates[0]+'&datetime_utc.lte='+dates[1]+'&lat='+dates[2]+'&lon='+dates[3];
  let client_id = 'MzM2MTA3MjN8MTY4Mzg3NjU1Ny40NDYyMjY2';
  let client_secret = '12f7446c216703173bcf8c4e5384daa755fdc322c827fbc0f05c8e7558b1313e';
  const getSeatGeekResult = async() =>{
    try{
      return await axios.get(url,{
        params:{
          'client_id': client_id,
          'client_secret': client_secret,
        }
      }
    );
    }catch(error){
      console.error(error);
    }
  }
  const seatGeekData = async() =>{
    const sresult = await getSeatGeekResult();
    if (sresult.status == 200){
      sres = sresult.data.events;
      res.send(sres);
    }
  }
  seatGeekData();
}

//client call to get yelp api data
app.get('/bizsearch/:x',(req,res) => {
  let coords = req.params.x.split(',');
  let lat = coords[0];
  let long = coords[1];
  let term = coords[2];
  let cat = coords[3];
  callToYelpApi(lat,long,term,cat,res);
});

//server call to yelp api
function callToYelpApi(lat,long,term,cat,res){
    let url = 'https://api.yelp.com/v3/businesses/search?term='+term+'&latitude='+lat+'&longitude='+long+'&categories='+cat+'&radius=16093&limit=10';
    let yelpKey = 'CybJp4vrG19COqSorVyriOa_ikx4NVUZ84XToSPjMWZ99Sr8fXzHe-qZ2GveMcwjPkVyaiZaacdEF4kwUx8an_569M-4YxJYiUcf1gb1eynOOPv8upuocMFsEy8_Y3Yx';
    let authToken = 'Bearer '+yelpKey;
    const getYelpResult = async() =>{
      try{
        return await axios.get(url,{
          headers:{
            'Authorization': authToken
          }
        }
      );
      }catch(error){
        console.error(error);
      }
    }
    const yelpData = async() =>{
      const result = await getYelpResult();
      if (result.status == 200){
        if(cat=="food"){
          yres = result.data.businesses;
        }else{
          hres = result.data.businesses;
        }
        res.send(result.data.businesses);
      }
    }
    yelpData();
}

//call to yelp reviews api
app.get('/reviews/:x',(req,res)=>{
  let revUrl = 'https://api.yelp.com/v3/businesses/'+req.params.x+'/reviews';
  let yelpKey = 'CybJp4vrG19COqSorVyriOa_ikx4NVUZ84XToSPjMWZ99Sr8fXzHe-qZ2GveMcwjPkVyaiZaacdEF4kwUx8an_569M-4YxJYiUcf1gb1eynOOPv8upuocMFsEy8_Y3Yx';
  let authToken = 'Bearer '+yelpKey;
  const getYelpReview = async() =>{
    try{
      return await axios.get(revUrl,{
        headers:{
          'Authorization': authToken
        }
      }
    );
    }catch(error){
      console.error(error);
    }
  }
  const yelpRevData = async() =>{
    const revres = await getYelpReview();
    if (revres.status == 200){
      res.send(revres.data.reviews);
    }
  }
  yelpRevData();
});

app.get("/recsearch/:x",(req,res)=>{
  let rec_inp = req.params.x.split(",");
  let client_id = 'MzM2MTA3MjN8MTY4Mzg3NjU1Ny40NDYyMjY2';
  let client_secret = '12f7446c216703173bcf8c4e5384daa755fdc322c827fbc0f05c8e7558b1313e';
    let url='https://api.seatgeek.com/2/recommendations?events.id='+rec_inp[0]+'&postal_code='+rec_inp[1]+'&datetime_utc.gte='+rec_inp[2]+'&client_id='+client_secret;
    const getSeatGeekRecommendations = async() =>{
      try{
        return await axios.get(url,{
          params:{
            'client_id': client_id,
            'client_secret': client_secret,
          }
        }
      );
      }catch(error){
        console.error(error);
      }
    }
    const seatGeekRecommendations = async() =>{
      const rec_result = await getSeatGeekRecommendations();
      if (rec_result.status == 200){
        const res_array = [];
        for(let k=0;k<Math.min(rec_result.data.recommendations.length,2);k++){
          let rec_obj = {
            'title': rec_result.data.recommendations[k].event.title,
            'venue': rec_result.data.recommendations[k].event.venue.name,
            'date': rec_result.data.recommendations[k].event.datetime_utc,
            'url': rec_result.data.recommendations[k].event.url,
            'image_url': rec_result.data.recommendations[k].event.performers[0].image,
            'affinity_score': rec_result.data.recommendations[k].score
          };
          res_array.push(rec_obj);
        }
        res.send(res_array);
      }
    }
    seatGeekRecommendations();
});

//call to Google things to do - api
app.get('/attractions/:x',(req,res)=>{
  attractions_arr = [];
  if(req.params.x[0] != '+'){
    const google_api_key = 'AIzaSyASbUA5whItqPIrzjqJfXN50OdOr8KZmlk';
    let base_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+req.params.x+'&language=en&key='+google_api_key;
    const photo_url = 'https://maps.googleapis.com/maps/api/place/photo?photoreference=';
    const photo_end_url = '&sensor=false&maxheight=300&maxwidth=200&key=';
    const getGoogleAttractions = async() =>{
      try{
        return await axios.get(base_url);
      }catch(error){
        console.log(error);
      }
    }
    const seekGoogleAttractionResults = async() =>{
      const gres = await getGoogleAttractions();
      if(gres.status == 200){
        for(let i=0;i<gres.data.results.length;i++){
          let gp_obj = {};
          gp_obj.name = gres.data.results[i].name;
          gp_obj.address = gres.data.results[i].formatted_address;
          gp_obj.open_now = gres.data.results[i].opening_hours;
          if(gres.data.results[i].photos != undefined){
            gp_obj.image_url = photo_url+gres.data.results[i].photos[0].photo_reference+photo_end_url+google_api_key;
          }else{
            gp_obj.image_url = "";
          }
          gp_obj.ratings = gres.data.results[i].rating+'/5';
          gp_obj.total_reviewers = gres.data.results[i].user_ratings_total;
          attractions_arr.push(gp_obj);
        }
        res.send(gres.data);
      }
    }
    seekGoogleAttractionResults();
  }else{
    res.send({});
  }
});

//hosting on port 3000
app.listen(3000, () =>{
  console.log("Explore Ease is listening on port 3000");
});
