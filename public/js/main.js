const $ = document.querySelector.bind(document);
el = { 
  gLabel:      $('#gLabel'    ),  // giphy label "Giphy"
  fuLabel:     $('#fuLabel'   ),  // fileupload label  "Upload Image"
  preview:     $('#preview'   ),  // div to show preview of selected image
  imgpreview:  $('#imgPreview'),  // div to show preview of selected image
  giphy:       $('#giphy'     ),  // fullscreen modal for giphy
  gquery:      $('#gquery'    ),  // input field to search giphy  
  gimages:     $('#gimages'   ),  // placeholder div for giphy results
  fuImage:     $('#image'     ),  // input form value for fileupload
  giphyurl:    $('#giphyurl'  ),  // hidden form value for giphy image
  clearImage:  $('#clearImage'),  // clears the selected image
  signform:    $('#signform'),    // form submission thingy
  comment:     $('#comment'),     // the comment textarea 
  
}
let dint; //debounce timeout int
if(el.signform){
  el.signform.addEventListener('submit',e=>{
    const commentValue = el.comment.value.trim();
    if(!commentValue.length){
      e.preventDefault();
      el.comment.classList.remove('flashbg');
      setTimeout(() => {el.comment.classList.add('flashbg');}, 10);
    }
    const giphyurlValue = el.giphyurl.value.trim();
    const fuImageValue = el.fuImage.value.trim();
    console.log(giphyurlValue,fuImageValue);
    if (!giphyurlValue && !fuImageValue) {
      e.preventDefault();
      el.preview.classList.remove('flashbg');
      setTimeout(() => {el.preview.classList.add('flashbg');}, 10);
      return;
    }
  });
}
// when an image is selected change is fired, fuImage.files contains results
// and simply set the preview background to our selected image
el.fuImage.addEventListener('change',e=>{
  let f = el.fuImage.files[0]; 
  let fr = new FileReader();  
  fr.onloadend = function(){
    el.imgpreview.src =  fr.result ;
    // el.preview.style.background =  'url(' + fr.result + ')'; 
    // el.preview.style.backgroundSize= 'contain';
    el.clearImage.classList.remove('hidden');
    el.gLabel.style.visibility = 'hidden';
    el.fuLabel.style.visibility = 'hidden';    

  }
  if(f){
    fr.readAsDataURL(f);
  }else{
    el.preview.style.background =  '';
  }

})

// show the giphy modal if we click the giphy label 
el.gLabel.addEventListener('click',e=>{
  el.giphy.style.opacity = '1';
  el.giphy.style.pointerEvents = "auto";
})

// hide the giphy modal if we click outside of the actual modal
el.giphy.addEventListener('click',e=>{
  if(e.target.closest('#modal')) return;
  el.giphy.style.opacity = '0';
  el.giphy.style.pointerEvents = "none";
})


// hide the giphy modal if we press escape
document.addEventListener('keydown', e=>{
  if(e.keyCode === 27){
    el.giphy.style.opacity = '0';
    el.giphy.style.pointerEvents = "none";
  }
})

// call the giphy api via /giphy?q=query, display results in #gimages
const getGiphy = async _=>{
  let val = el.gquery.value;
  el.gquery.placeholder =val;
  el.gquery.value ='';
  el.gquery.blur();
  let response = await fetch(`/giphy?q=${val}`);
  let data = await  response.text();
  el.gimages.innerHTML = data;
}


// on keyup we reset the timeout function to wait 2 seconds since last keystroke to perform the search
el.gquery.addEventListener('keyup', e=>{
  clearInterval(dint);  
  console.log(e.keyCode);
  if(e.keyCode == 13) { //if we press return/enter then fire immediately
    e.preventDefault();
    getGiphy();
  }else{
    dint = setTimeout(_=>{getGiphy()},2000); //otherwise wait 2 seconds before firing
  }
});


// reset the value to the placeholder text
el.gquery.addEventListener('focus',e=>{  el.gquery.value = el.gquery.placeholder ;});


// this handles clicking a giphy result image to select it
document.addEventListener('click',e=>{
  // make sure we've clicked on a .gthumb  "giphy thumbnail"
  if (e.target.classList.contains('gthumb') || e.target.closest('.gthumb')) { 
    // let src =e.target.style.backgroundImage ;
    let src =e.target.src;
    console.log(e.target,src);
    el.imgpreview.src = src;
    // el.preview.style.backgroundImage = `url(${src})`;// src;
    el.giphyurl.value = src;//src.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
    // el.preview.style.backgroundSize= 'cover';
    el.giphy.style.opacity = '0';
    el.giphy.style.pointerEvents = "none";
    el.clearImage.classList.remove('hidden');
    el.gLabel.style.visibility = 'hidden';
    el.fuLabel.style.visibility = 'hidden';    
  }  
});

el.clearImage.addEventListener('click',e=>{
  el.imgpreview.src = '';
  // el.preview.style.backgroundImage = '';
  el.clearImage.classList.add('hidden');
  el.gLabel.style.visibility = 'visible';
  el.fuLabel.style.visibility = 'visible';
});
