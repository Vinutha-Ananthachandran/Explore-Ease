//global variable declarations
let ip_lat;
let ip_long;
let loc_submit;
let loc_city;
let loc_country;
let yelp_result;
const rcm_result = [];
let seat_geek_result;
let map_lat;
let map_long;
let flag=false;
let map;
let marker;
let fav = "&#9829;";
let nofav = "&#9825;";
let favflag = [true,true,true,true,true,true,true,true,true,true];
let eventFavFlag = [true,true];
let sanitization_pattern = /^[a-zA-Z0-9\s,]+$/;
let curr_tab='paginationTable0';

//event handler for "plan my trip" button
function submit_form(){
  let dep_date = document.getElementById("exploreEaseDeparture");
  let ret_date = document.getElementById("exploreEaseReturn");
  let location = document.getElementById("exploreEaseLocation");
  let chk = document.getElementById("exploreEaseAutoDetect");
  let load = document.getElementById("loader");
  let res_button = document.getElementById("exploreEaseResults");
  let start = new Date(dep_date.value);
  let end = new Date(ret_date.value);
  if(chk.checked == false && location.value == ""){
    alert("Please enter the destination location");
    res_button.style.display = "inline-block";
    load.style.display = "none";
  }else if(dep_date.value == ""){
    alert("Please enter the departure date");
    res_button.style.display = "inline-block";
    load.style.display = "none";
  }else if(ret_date.value == ""){
    alert("Please enter the return date");
    res_button.style.display = "inline-block";
    load.style.display = "none";
  }else if(end < start){
    alert("Invalid date range");
    res_button.style.display = "inline-block";
    load.style.display = "none";
  }else {
    if(perform_data_sanitization(location.value)){
      res_button.style.display = "none";
      load.style.display = "inline-block";
      if(chk.checked == false){
        let loc = location.value;
        let sp_loc = loc.replace(/[,.-]+/g,"");
        let pl_loc = sp_loc.replace(/[\s]+/g,"+");
        fetch_geocoding_result(pl_loc);
      }else{
        display_explore_ease_results(dep_date.value,ret_date.value);
      }
    }else{
      alert("Incorrect characters found in the input. Please rectify it.");
      res_button.style.display = "inline-block";
      load.style.display = "none";
    }
  }
}

//performs XSS exploit prevention
function perform_data_sanitization(location){
  if(location != ''){
    location = location.trim();
    if(!location.match(sanitization_pattern)){
      return false;
    }
  }
  return true;
}

//calling the server to get the yelp api data
function display_explore_ease_results(ddate,rdate){
  let node_req = new XMLHttpRequest();
  let biz_input = loc_submit+',food,food';
  node_req.open("GET","/bizsearch/"+biz_input,true);
  node_req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      yelp_result = JSON.parse(this.responseText);
      if(yelp_result.length != 0){
        loc_city = yelp_result[0].location.city;
      }else{
        loc_city = '';
      }
      next_call_seat_geek(ddate,rdate);
    }
  };
  node_req.send();
}

//calling the server to get seatgeek api data
function next_call_seat_geek(ddate,rdate){
  let coords = loc_submit.split(",");
  let sg_input = ddate+","+rdate+","+coords[0]+","+coords[1];
  let sg_node_req = new XMLHttpRequest();
  sg_node_req.open("GET","/seatgeek/"+sg_input,true);
  sg_node_req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      seat_geek_result = JSON.parse(this.responseText);
      next_call_hotels();
    }
  };
  sg_node_req.send();
}

//calling the server to get hotel api data
function next_call_hotels(){
  let ht_node_req = new XMLHttpRequest();
  let biz_input = loc_submit+',hotel,hotelstravel';
  ht_node_req.open("GET","/bizsearch/"+biz_input,true);
  ht_node_req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      hotel_result = JSON.parse(this.responseText);
      next_call_attractions();
    }
  };
  ht_node_req.send();
}

//calling the server to get google things to do - api data
function next_call_attractions(){
  const atab_id = document.getElementById("atab_id");
  const atab_navbar = document.getElementById("atab_navbar");
  let gp_nreq = new XMLHttpRequest();
  let gp_input = loc_city.replaceAll(" ","+")+"+point+of+interest";
  gp_nreq.open("GET","/attractions/"+gp_input,true);
  gp_nreq.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      let gp_result = JSON.parse(this.responseText);
      let anchor = document.getElementById("exploreEaseResults");
      location.href = "/results";
      document.getElementById("loader").style.display = 'none';
      document.getElementById("exploreEaseResults").style.display = 'inline-block';
      document.getElementById("exploreEaseAutoDetect").checked = false;
      document.getElementById("exploreEaseLocation").disabled = false;
      document.getElementById("exploreEaseLocation").required = true;
    }
  };
  gp_nreq.send();
}

//event handler for sending an email on click of share button
function send_email(tag_id,title,venue,url,date){
  var sub = 'Explore Ease | Event Link | '+title+ ' @ ' +venue;
  var line1 = 'Greetings From Explore Ease!! \n\n';
  var line2 = 'Your friend is sharing the following event with you: \n';
  var line3 = '\tEvent Name: '+title+'\n';
  var line4 = '\tEvent Venue: '+venue+'\n';
  var line5 = '\tEvent Date: '+date+'\n\n';
  var line6 = 'Book your tickets here: '+url;
  var line7 = '\n\nHave fun at the event!!\n\n';
  var mail = encodeURIComponent(line1+line2+line3+line4+line5+line6+line7);
  document.getElementById(tag_id).setAttribute('href',"mailto:?subject="+sub+"&body="+mail);
}

//event handler for sending an email from recommendations page
function send_recomm_email(recomm_id){
  if(recomm_id == 1){
    let title = document.getElementById("recomm_txt1").innerHTML;
    let loc = document.getElementById("recomm_loc1").innerHTML;
    let eurl = document.getElementById("recomm_anc1").innerHTML;
    let date = document.getElementById("recomm_dat1").innerHTML;
    send_email("recomm_email1",title,loc.substring(2,loc.length),eurl,date.substring(2,date.length));
  }else{
    let title = document.getElementById("recomm_txt2").innerHTML;
    let loc = document.getElementById("recomm_loc2").innerHTML;
    let eurl = document.getElementById("recomm_anc2").innerHTML;
    let date = document.getElementById("recomm_dat2").innerHTML;
    send_email("recomm_email2",title,loc.substring(2,loc.length),eurl,date.substring(2,date.length));
  }
}

//calling the google geocoding api to convert the user entered location to latitude and longitude
function fetch_geocoding_result(location){
  let dep_date = document.getElementById("exploreEaseDeparture");
  let ret_date = document.getElementById("exploreEaseReturn");
  let geo_req = new XMLHttpRequest();
  geo_req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      let loc_geo_code = JSON.parse(this.responseText);
      ip_lat = loc_geo_code.results[0].geometry.location.lat;
      ip_long = loc_geo_code.results[0].geometry.location.lng;
      loc_submit = ip_lat +","+ ip_long;
      display_explore_ease_results(dep_date.value,ret_date.value);
    }
  };
  geo_req.open("GET","https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyASbUA5whItqPIrzjqJfXN50OdOr8KZmlk",true);
  geo_req.send();
}

//disabling previous dates in the calendar
function set_curr_dep_date(){
  //let date = new Date().toISOString().split('T')[0];
  let min_date = get_min_date_format();
  let departure = document.getElementById("exploreEaseDeparture");
  departure.setAttribute('min',min_date);
}

//getting today's date
function get_min_date_format(){
  let date = new Date();
  let cyear = date.getFullYear();
  let cmon = date.getMonth() + 1;
  let cdate = date.getDate();
  if(cmon < 10){
    cmon = '0'+cmon;
  }
  if(cdate < 10){
    cdate = '0'+cdate;
  }
  let cday = cyear+'-'+cmon+'-'+cdate;
  return cday;
}

//disabling previous dates for return date
function set_curr_ret_date(){
  //let date = new Date().toISOString().split('T')[0];
  let min_date = get_min_date_format();
  let dreturn = document.getElementById("exploreEaseReturn");
  dreturn.setAttribute('min',min_date);
}

//event handler for disabling location input field when auto-detect is seleted
function disable_req(){
  let chk = document.getElementById("exploreEaseAutoDetect");
  let location = document.getElementById("exploreEaseLocation");
  if(chk.checked == true){
    location.required = false;
    location.disabled = true;
    location.value = "";
    fetch_user_lat_long_ipinfo();
  }else{
    location.disabled = false;
    location.required = true;
  }
}

//auto detecting user's location using IP.info API
function fetch_user_lat_long_ipinfo() {
  const latlong_request = async () => {
    const latlong_response = await fetch("https://ipinfo.io/json?token=e33cdfd60a0c2e");
    const latlong_result = await latlong_response.json();
    loc_submit = latlong_result.loc;
    loc_country = latlong_result.country;
  }
  latlong_request();
}

//event handler for "get directions" button
//call to google map to display interacting map
function launch_quick_view(address){
  let addr_set = address.split(',');
  const exploreModal= document.getElementById('exploreEaseModel');
  const modalEl = new bootstrap.Modal(exploreModal);
  const exploreText = document.getElementById('exploreModelText');
  let addr_string = '';
  for(let i=0; i < addr_set.length-2;i++){
    if (addr_set[i] != ''){
      addr_string = addr_string + ' ' + addr_set[i];
      if(i==4){
        addr_string = addr_string+'-';
      }
    }
  }
  map_lat = addr_set[addr_set.length-2];
  map_long = addr_set[addr_set.length-1];
  exploreText.innerHTML = addr_string;
  if(flag == false){
    let script = document.createElement('script');
    script.setAttribute('src','https://maps.googleapis.com/maps/api/js?key=AIzaSyASbUA5whItqPIrzjqJfXN50OdOr8KZmlk&callback=get_map');
    script.classList.add('exploreEaseMap');
    document.head.appendChild(script);
    flag = true;
  }else{
    let new_center = myCenter = new google.maps.LatLng(map_lat,map_long);
    map.setCenter(new_center);
    marker.setPosition(new_center);
  }
  modalEl.show();
}

//setting map markers and callback to google map api
function get_map() {
    let myCenter = new google.maps.LatLng(map_lat,map_long);
    let mapCanvas = document.getElementById("exploreEaseMap");
    let mapOptions = {center: myCenter, zoom: 10};
    map = new google.maps.Map(mapCanvas, mapOptions);
    marker = new google.maps.Marker({position:myCenter});
    marker.setMap(map);
  }

//call to server to get yelp reviews
function get_reviews(biz_id){
  let rev_node_req = new XMLHttpRequest();
  rev_node_req.open("GET","/reviews/"+biz_id,true);
  rev_node_req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      hotel_reviews = JSON.parse(this.responseText);
      set_modal_display(hotel_reviews);
    }
  };
  rev_node_req.send();
}

//display reviews in the modal window
function set_modal_display(hotel_reviews){
  const exploreRevModal= document.getElementById('exploreEaseRevModal');
  const modalRev = new bootstrap.Modal(exploreRevModal);
  for(let i=1;i<=3;i++){
    const exploreReviewer = document.getElementById('reviewer'+i);
    const exploreReview = document.getElementById('review'+i);
    const exploreReviewRating = document.getElementById('revRating'+i);
    const exploreReviewTime = document.getElementById('revTime'+i);
    exploreReviewer.innerHTML = 'Reviewer: '+hotel_reviews[i-1].user.name;
    exploreReview.innerHTML = hotel_reviews[i-1].text;
    exploreReviewRating.innerHTML = 'Rating: '+hotel_reviews[i-1].rating+'/5';
    exploreReviewTime.innerHTML = 'Review Date: '+hotel_reviews[i-1].time_created.substring(0,10).split('-').reverse().join('-');
  }
  modalRev.show();
}

//save the favorited events
function store_recommendations(event){
  if(event==1){ //recommendations 1
    let title = document.getElementById("recomm_txt1").innerHTML;
    title = title.replaceAll(',','');
    let date = document.getElementById("recomm_dat1").innerHTML;
    let img = encodeURIComponent(document.getElementById("recomm_img1").getAttribute('src'));
    let ven = document.getElementById("recomm_loc1").innerHTML;
    let url = encodeURIComponent(document.getElementById("recomm_anc1").innerHTML);
    let mfav = document.getElementById("modalFavButton1");
    if(eventFavFlag[0]){
      mfav.innerHTML = fav;
      eventFavFlag[0] = false;
      let sdata = title + ',' + date.substring(2,date.length);
      save_data(sdata,"favoriteLogEntries");
      let storage_string = img+','+title+','+ven.substring(2,ven.length)+','+url+','+date.substring(2,date.length);
      save_data(storage_string,"favoriteDataEntries");
    }else{
      mfav.innerHTML = nofav;
      eventFavFlag[0] = true;
      let rdata = title + ',' + date.substring(2,date.length);
      remove_data(0,rdata,"favoriteLogEntries");
      remove_data(1,rdata,"favoriteDataEntries");
    }
  }else if(event==2){ //recommendations 2
    let title = document.getElementById("recomm_txt2").innerHTML;
    title = title.replaceAll(',','');
    let date = document.getElementById("recomm_dat2").innerHTML;
    let img = encodeURIComponent(document.getElementById("recomm_img2").getAttribute('src'));
    let ven = document.getElementById("recomm_loc2").innerHTML;
    let url = encodeURIComponent(document.getElementById("recomm_anc2").innerHTML);
    let mfav = document.getElementById("modalFavButton2");
    if(eventFavFlag[1]){
      document.getElementById("modalFavButton2").innerHTML = fav;
      eventFavFlag[1] = false;
      let sdata = title + ',' + date.substring(2,date.length);
      save_data(sdata,"favoriteLogEntries");
      let storage_string = img+','+title+','+ven.substring(2,ven.length)+','+url+','+date.substring(2,date.length);
      save_data(storage_string,"favoriteDataEntries");
    }else{
      document.getElementById("modalFavButton2").innerHTML = nofav;
      eventFavFlag[1] = true;
      let rdata = title + ',' + date.substring(2,date.length);
      remove_data(0,rdata,"favoriteLogEntries");
      remove_data(1,rdata,"favoriteDataEntries");
    }
  }else{ //main events page
    let st_input = event.split(",");
    let input = [];
    input.push(st_input[0]);
    input.push(st_input[1]);
    input.push(st_input.slice(2,st_input.length-3).join(' '));
    input.push(st_input[st_input.length-3]);
    input.push(st_input[st_input.length-2]);
    input.push(st_input[st_input.length-1]);
    let fbutton = document.getElementById("favbutton"+input[0]);
    if(favflag[input[0]]){
      fbutton.innerHTML = fav;
      favflag[input[0]] = false;
      let sdata = input[2]+','+input[input.length-1];
      save_data(sdata,"favoriteLogEntries");
      input[1] = encodeURIComponent(input[1]);
      input[input.length-2] = encodeURIComponent(input[input.length-2]);
      let storage_string = input.slice(1,input.length).join(',');
      save_data(storage_string,"favoriteDataEntries");
    }else{
      fbutton.innerHTML = nofav;
      favflag[input[0]] = true;
      let rdata = input[2]+','+input[input.length-1];
      remove_data(0,rdata,"favoriteLogEntries");
      remove_data(1,rdata,"favoriteDataEntries");
    }
  }
}

//remove the favorited event
function remove_from_favorites(data){
  remove_data(0,data,"favoriteLogEntries");
  remove_data(1,data,"favoriteDataEntries");
  display_favorites();
}

//save to storage
function save_data(input,label){
  let existing = localStorage.getItem(label);
  if(existing == undefined || existing == null || existing == ''){
    localStorage.setItem(label,input);
  }else{
    if(is_original(existing,input)){
      new_data = existing + '|' + input;
      localStorage.removeItem(label);
      localStorage.setItem(label,new_data);
    }
  }
}

//avoid redundant favorite events
function is_original(existing,input){
  let inptag = input.split(",");
  let exist_arr = existing.split("|");
  for(let i=0;i<exist_arr.length;i++){
    let inp_arr = exist_arr[i].split(',');
    if(inp_arr[0] == inptag[0] && inp_arr[inp_arr.length-1] == inptag[inptag.length-1]){
      return false;
    }
  }
  return true;
}

//remove favorited event data from storage
function remove_data(index,input,label){
  let existing = localStorage.getItem(label);
  let inptag = input.split(",");
  if(existing != undefined & existing != null & existing != ''){
    let log_arr = existing.split("|");
    let new_log = '';
    for(let i=0;i<log_arr.length;i++){
      let ftag = log_arr[i].split(',');
      if(ftag[index] != inptag[0] || ftag[ftag.length-1] != inptag[1]){
        if(new_log == ''){
          new_log = log_arr[i];
        }else{
          new_log = new_log + '|' + log_arr[i];
        }
      }
    }
    localStorage.removeItem(label);
    localStorage.setItem(label,new_log);
  }
}

//call the server to get recommendations
function get_recommendations(event_inp){
  const existing = localStorage.getItem("favoriteLogEntries");
  const exploreRecModal= document.getElementById('RecommendationModal');
  const modalRec = new bootstrap.Modal(exploreRecModal);
  document.getElementById("recomm_cell1").classList.add('d-none');
  document.getElementById("recomm_cell2").classList.add('d-none');
  document.getElementById("modalFavButton1").innerHTML = nofav;
  eventFavFlag[0] = true;
  document.getElementById("modalFavButton2").innerHTML = nofav;
  eventFavFlag[1] = true;
  let rec_node_req = new XMLHttpRequest();
  rec_node_req.open("GET","/recsearch/"+event_inp,true);
  rec_node_req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      let res_array = JSON.parse(this.responseText);
      for(let i=1;i<=res_array.length;i++){
        let match = res_array[i-1].affinity_score*100;
        document.getElementById("recomm_score"+i).innerHTML = match + '% Match';
        document.getElementById("recomm_img"+i).setAttribute('src',res_array[i-1].image_url);
        document.getElementById("recomm_txt"+i).innerHTML = res_array[i-1].title;
        document.getElementById("recomm_loc"+i).innerHTML = '&#128204; ' + res_array[i-1].venue;
        document.getElementById("recomm_dat"+i).innerHTML = '&#128198;' + res_array[i-1].date.substring(0,10).split("-").join("-");
        document.getElementById("recomm_anc"+i).innerHTML = res_array[i-1].url;
        if(existing != undefined && existing != '' && existing != null){
          if(is_original(existing,res_array[i-1].title+','+res_array[i-1].date.substring(0,10).split("-").join("-"))){
            document.getElementById("modalFavButton"+i).innerHTML = nofav;
            eventFavFlag[i-1] = true;
          }else{
            document.getElementById("modalFavButton"+i).innerHTML = fav;
            eventFavFlag[i-1] = false;
          }
        }
        document.getElementById("recomm_cell"+i).classList.remove('d-none');
      }
      modalRec.show();
    }
  };
  rec_node_req.send();
}

//call the server to get favorites page
function display_favorites(){
  let fav_req = new XMLHttpRequest();
  let fav_input = localStorage.getItem("favoriteDataEntries");
  if(fav_input == ''){
    fav_input = '$';
  }
  fav_req.open("GET","/set_favorites/"+fav_input,true);
  fav_req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      fres = this.responseText;
      let anch = document.getElementById("exploreEaseFavorites");
      location.href="/favorites";
    }
  };
  fav_req.send();
}

//open the events in a new tab
function open_tab(url){
  if(url == 1){
    window.open(document.getElementById("recomm_anc1").innerHTML);
  }else if(url == 2){
    window.open(document.getElementById("recomm_anc2").innerHTML);
  }else{
    window.open(url,"_blank");
  }
}

//pagination setup
function navigate_to_page(pageno,arr_length){
  for(let i=0;i<arr_length;i++){
    let tabid = 'paginationTable'+i;
    if(i != pageno){
      document.getElementById(tabid).classList.add('d-none');
    }
  }
  document.getElementById('paginationTable'+pageno).classList.remove('d-none');
  curr_tab = 'paginationTable'+pageno;
  let navpage = parseInt(pageno)+1;
  for(let j=1;j<=arr_length;j++){
    let navid = 'paginationNavBar'+j;
    if(j != navpage){
      document.getElementById(navid).style.backgroundColor = 'black';
      document.getElementById(navid).style.color = '#ffc107';
    }
  }
  document.getElementById('paginationNavBar'+navpage.toString()).style.color = 'black';
  document.getElementById('paginationNavBar'+navpage.toString()).style.backgroundColor = '#ffc107';
  window.location.href = '#resultsTabs';
}

//pagination - previous button functionality
function get_previous(arr_length){
  if(arr_length != 0){
    let new_page = parseInt(curr_tab[curr_tab.length-1]);
    if(new_page == 0){
      navigate_to_page(new_page.toString(),arr_length);
    }else{
      new_page = new_page - 1;
      navigate_to_page(new_page.toString(),arr_length);
    }
  }
}

//pagination - next button functionality
function get_next(arr_length){
  if(arr_length != 0){
    let new_page = parseInt(curr_tab[curr_tab.length-1]);
    if(new_page == 3){
      navigate_to_page(new_page.toString(),arr_length);
    }else{
      new_page = new_page + 1;
      navigate_to_page(new_page.toString(),arr_length);
    }
  }
}

if(typeof module === 'object'){
  module.exports = is_original;
}
